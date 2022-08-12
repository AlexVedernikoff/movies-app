const deepEqual = (obj1, obj2, isEqual = true) => {
  if (
    typeof obj1 !== "object" ||
    typeof obj2 !== "object" ||
    obj1 == null ||
    obj2 == null
  ) {
    if (obj1 === obj2) {
      isEqual = true;
      return isEqual;
    } else {
      isEqual = false;
      return isEqual;
    }
  }

  // Значения ключей в объекте 1:
  const keys1 = Object.keys(obj1);
  // Значения ключей в объекте 2:
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    // Количество ключей в объектах не совпадает, поэтому объекты не равны.
    isEqual = false;
    return isEqual;
  }

  keys1.forEach((key) => {
    if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
      // console.log('Свойство является объектом');
      isEqual = deepEqual(obj1[key], obj2[key], isEqual);
    } else if (obj1[key] !== obj2[key]) {
      isEqual = false;
    }
  });

  return isEqual;
};

export default deepEqual;
