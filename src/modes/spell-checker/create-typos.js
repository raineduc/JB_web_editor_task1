import Typo from "typo-js";

onmessage = (e) => {
  const typo = new Typo(e.data[0], e.data[1], e.data[2]);
  postMessage(typo);
}