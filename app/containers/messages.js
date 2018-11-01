import ru from "./ru";
import en from "./en";
import es from "./es";

export default {
  //ENGLISH//
  ...en,

  // RUSSIAN//
  ...ru,

  //SPANISH
  ...es
};
console.log({ ...en });
