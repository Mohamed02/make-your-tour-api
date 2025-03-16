export const catchAsync = (fn)=>{
    return async (req,res,next)=>{
      try {
         await fn(req,res,next);
      } catch(error) {
        // Transfer the error to Global error handler middleware
        next(error);
      }
    }
  };