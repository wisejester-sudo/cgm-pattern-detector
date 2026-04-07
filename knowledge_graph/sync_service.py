#!/usr/bin/env python3
"""
Knowledge Graph Smart Sync Service
Only syncs when data changes. Silent operation - no notifications for routine syncs.
"""

import json
import hashlib
import os
import sys
from datetime import datetime, time
from pathlib import Path
from typing import Dict, List, Optional, Set
import logging

# Configure silent logging (file only, no console spam)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/Users/kevron/.openclaw/workspace/knowledge_graph/sync.log'),
        # No console handler = silent operation
    ]
)
logger = logging.getLogger(__name__)

class KnowledgeGraphSync:
    def __init__(self, config_path: str = "kg_sync_config.json"):
        self.config_path = Path(config_path)
        self.config = self._load_config()
        self.workspace = Path("/Users/kevron/.openclaw/workspace")
        self.state_file = self.workspace / "knowledge_graph" / "sync_state.json"
        self.state = self._load_state()

    def _load_config(self) -> Dict:
        """Load sync configuration."""
        if self.config_path.exists():
            with open(self.config_path) as f:
                return json.load(f)
        return self._default_config()

    def _default_config(self) -> Dict:
        """Default configuration - silent, smart, no spam."""
        return {
            "silent_hours": {"start": "22:00", "end": "08:00"},
            "notification_policy": {
                "on_success": False,  # NEVER notify on success
                "on_failure": True,   # Only notify on actual errors
                "on_critical": True,  # Data loss, corruption
                "on_significant_change": True  # >20% entities changed
            },
            "sync_rules": {
                "deduplicate": True,  # Skip if hash matches
                "incremental_only": True,  # Never full sync unless forced
                "min_interval_minutes": 5,  # Don't sync more often than 5 min
                "max_staleness_hours": 24  # Force sync if >24h stale
            },
            "sources": {
                "cojma/data/knowledge_graph.json": {
                    "triggers": ["file_change", "market_open"],
                    "priority": "high"
                },
                "projects/dispatchly/knowledge_graph_entities.json": {
                    "triggers": ["file_change", "git_commit"],
                    "priority": "medium"
                },
                "memory/*.md": {
                    "triggers": ["file_change"],
                    "priority": "low",
                    "batch_window_minutes": 30  # Batch memory updates
                }
            }
        }

    def _load_state(self) -> Dict:
        """Load sync state (hashes, timestamps)."""
        if self.state_file.exists():
            with open(self.state_file) as f:
                state = json.load(f)
                # Ensure required keys exist
                state.setdefault("entities", {})
                state.setdefault("last_sync", None)
                state.setdefault("sync_count", 0)
                return state
        return {"entities": {}, "last_sync": None, "sync_count": 0}

    def _save_state(self):
        """Save sync state."""
        self.state_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.state_file, 'w') as f:
            json.dump(self.state, f, indent=2)

    def _compute_hash(self, filepath: Path) -> str:
        """Compute MD5 hash of file content."""
        if not filepath.exists():
            return ""
        with open(filepath, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()

    def _is_silent_hours(self) -> bool:
        """Check if currently in silent hours (no notifications)."""
        now = datetime.now().time()
        start = datetime.strptime(self.config["silent_hours"]["start"], "%H:%M").time()
        end = datetime.strptime(self.config["silent_hours"]["end"], "%H:%M").time()
        
        if start <= end:
            return start <= now <= end
        else:  # Crosses midnight
            return now >= start or now <= end

    def _should_notify(self, event_type: str, changes: Dict) -> bool:
        """Determine if notification should be sent."""
        policy = self.config["notification_policy"]
        
        if event_type == "success" and not policy["on_success"]:
            return False
        if event_type == "failure" and not policy["on_failure"]:
            return False
        if event_type == "critical" and policy["on_critical"]:
            return not self._is_silent_hours()
        if event_type == "significant_change" and policy["on_significant_change"]:
            # Only notify if >20% entities changed
            total = changes.get("total_entities", 0)
            modified = changes.get("modified", 0)
            if total > 0 and (modified / total) > 0.2:
                return not self._is_silent_hours()
        return False

    def _has_data_changed(self, source_path: Path) -> bool:
        """Check if source file has changed since last sync."""
        current_hash = self._compute_hash(source_path)
        stored_hash = self.state["entities"].get(str(source_path), {}).get("hash")
        return current_hash != stored_hash

    def _sync_source(self, source: str, force: bool = False) -> Dict:
        """Sync a single source if changed."""
        source_path = self.workspace / source
        
        if not source_path.exists():
            logger.warning(f"Source not found: {source}")
            return {"status": "skipped", "reason": "source_missing"}

        # Check if actually changed
        if not force and not self._has_data_changed(source_path):
            logger.info(f"No change detected: {source}")
            return {"status": "skipped", "reason": "no_change"}

        # Check min interval
        last_sync = self.state["entities"].get(str(source_path), {}).get("last_sync")
        if last_sync and not force:
            last = datetime.fromisoformat(last_sync)
            minutes_since = (datetime.now() - last).total_seconds() / 60
            if minutes_since < self.config["sync_rules"]["min_interval_minutes"]:
                return {"status": "skipped", "reason": "rate_limited"}

        # Perform sync
        try:
            with open(source_path) as f:
                data = json.load(f)
            
            # Update sync metadata
            current_hash = self._compute_hash(source_path)
            self.state["entities"][str(source_path)] = {
                "hash": current_hash,
                "last_sync": datetime.now().isoformat(),
                "entity_count": len(data.get("entities", []))
            }
            self.state["last_sync"] = datetime.now().isoformat()
            self.state["sync_count"] += 1
            self._save_state()

            logger.info(f"Synced: {source} ({len(data.get('entities', []))} entities)")
            return {
                "status": "success",
                "entities": len(data.get("entities", [])),
                "source": source
            }

        except Exception as e:
            logger.error(f"Sync failed: {source} - {e}")
            return {"status": "error", "error": str(e), "source": source}

    def sync_all(self, force: bool = False) -> Dict:
        """Sync all sources that have changed."""
        results = []
        changes = {"total_entities": 0, "modified": 0}
        
        for source, rules in self.config["sources"].items():
            result = self._sync_source(source, force=force)
            results.append(result)
            
            if result["status"] == "success":
                changes["modified"] += 1
                changes["total_entities"] += result.get("entities", 0)

        summary = {
            "timestamp": datetime.now().isoformat(),
            "results": results,
            "changed": changes["modified"] > 0,
            "should_notify": self._should_notify("success", changes) if changes["modified"] > 0 else False
        }

        # Only log summary if something actually happened
        if changes["modified"] > 0:
            logger.info(f"Sync complete: {changes['modified']} sources updated")
        
        return summary

    def get_status(self) -> Dict:
        """Get current sync status."""
        return {
            "last_sync": self.state.get("last_sync"),
            "total_syncs": self.state.get("sync_count", 0),
            "sources_tracked": len(self.state.get("entities", {})),
            "config": self.config
        }


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="KG Sync Service")
    parser.add_argument("--force", action="store_true", help="Force sync regardless of changes")
    parser.add_argument("--status", action="store_true", help="Show sync status")
    args = parser.parse_args()

    sync = KnowledgeGraphSync()
    
    # Suppress ALL stdout to prevent notifications
    import os
    sys.stdout = open(os.devnull, 'w')
    
    if args.status:
        # Restore stdout only for status command
        sys.stdout = sys.__stdout__
        print(json.dumps(sync.get_status(), indent=2))
    else:
        # Silent operation - no stdout output whatsoever
        result = sync.sync_all(force=args.force)
        # Results are logged to file only, no console output
        sys.exit(0 if result.get("status") != "error" else 1)
