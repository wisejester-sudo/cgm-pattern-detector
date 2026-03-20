"use client"

export function WorkspaceBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid of subtle field service images */}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-3">
        {/* Tool/Equipment images - very low opacity */}
        <div 
          className="bg-cover bg-center opacity-[0.04]"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1581147036324-c17ac41dd161?w=400&q=60)' }}
        />
        <div 
          className="bg-cover bg-center opacity-[0.03]"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&q=60)' }}
        />
        <div 
          className="bg-cover bg-center opacity-[0.04]"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&q=60)' }}
        />
        <div 
          className="bg-cover bg-center opacity-[0.03]"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&q=60)' }}
        />
        <div 
          className="bg-cover bg-center opacity-[0.03]"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=60)' }}
        />
        <div 
          className="bg-cover bg-center opacity-[0.04]"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=60)' }}
        />
        <div 
          className="bg-cover bg-center opacity-[0.03]"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&q=60)' }}
        />
        <div 
          className="bg-cover bg-center opacity-[0.04]"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1595814433015-e6f5ce69614e?w=400&q=60)' }}
        />
        <div 
          className="bg-cover bg-center opacity-[0.04]"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=60)' }}
        />
        <div 
          className="bg-cover bg-center opacity-[0.03]"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=400&q=60)' }}
        />
        <div 
          className="bg-cover bg-center opacity-[0.04]"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=60)' }}
        />
        <div 
          className="bg-cover bg-center opacity-[0.03]"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&q=60)' }}
        />
      </div>
      
      {/* Gradient overlays to ensure readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/80 to-background/90" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-background/70" />
    </div>
  )
}
