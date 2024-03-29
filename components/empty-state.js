'use client'
import { Player } from '@lottiefiles/react-lottie-player';

const EmptyState = () => {

    return  (
        <div>
     <Player
    src='/empty.json'
    className="player"
    loop
    autoplay
    style={{ height: '400px', width: '400px' }}
/>
    <div className='text-2xl font-semibold text-muted-foreground pb-2 text-center'>No loans found</div>
    </div>
    )
    
   
}

export default EmptyState