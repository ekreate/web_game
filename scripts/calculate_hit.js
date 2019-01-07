var resolution = 4*15;
onmessage = function (e,f) {
  iO = e.data.io
  iA = e.data.ia
  ia = new Uint8ClampedArray(iA)
  io = new Uint8ClampedArray(iO)
  for (var i = 0; i < ia.length; i+= resolution){if( (ia[i+3]) && (io[i+3]) ) {postMessage(true);}}
  postMessage(false);
}
