const ratingColor = (rating) => {
  const color = ["#E90000", "#E97E00", "#E9D100", "#66E900"];

  if (rating < 3) {
    return color[0];
  } else if (rating >= 3 && rating < 5) {
    return color[1];
  } else if (rating >= 5 && rating < 7) {
    return color[2];
  } else if (rating >= 7) {
    return color[3];
  }
};

export default ratingColor;
