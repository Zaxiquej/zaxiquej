importScripts('glass.js');
onmessage=event=>{const {width,height,count,pixels,seed}=event.data;try{const cells=GlassGeometry.build(width,height,count,pixels,seed,value=>postMessage({type:'progress',value}));postMessage({type:'done',cells})}catch(error){postMessage({type:'error',message:error.message})}};
