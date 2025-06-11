import fakeImage from "/hinh-anh-tai-khoan-het-tien-18.jpg";

export const getImageUrl = (url) => {
  // Always return the fake image for now as requested.
  // We can use an env variable to control this later.
  return fakeImage;
  // A more robust implementation:
  // if (import.meta.env.VITE_USE_FAKE_IMAGES === 'true' || !url) {
  //   return fakeImage;
  // }
  // return url;
};
