export const catchAsyncError = (theFunction) => {
  return (res, req, next) => {
    Promise.resolve(theFunction(res, req, next)).catch(next);
  };
};
