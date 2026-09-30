'use strict';
importScripts('calibration.js?v=5.16','nonfollowers.js?v=5.16','class-identity.js?v=5.16','token-delivery.js?v=5.16','engine.js?v=5.16','inspector-search.js?v=5.16');
let cancel=null;
self.onmessage=({data})=>{
  if(cancel)cancel();
  try{cancel=SVWBSearch.scan(SVWB,data,result=>self.postMessage(result));}
  catch(e){self.postMessage({error:e.message});}
};
