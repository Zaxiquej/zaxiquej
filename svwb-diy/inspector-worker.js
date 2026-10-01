'use strict';
importScripts('calibration.js?v=5.17','nonfollowers.js?v=5.17','class-identity.js?v=5.17','token-delivery.js?v=5.17','engine.js?v=5.17','inspector-search.js?v=5.17');
let cancel=null;
self.onmessage=({data})=>{
  if(cancel)cancel();
  try{cancel=SVWBSearch.scan(SVWB,data,result=>self.postMessage(result));}
  catch(e){self.postMessage({error:e.message});}
};
