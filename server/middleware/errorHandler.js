function errorHandler(err,req,res,next){
    console.error(err);
    let status = 500;
    let message = 'Internal Server Error';
    
    if(err.isOperational){
        message = err.message;
    }

    if(err.status){
        status = err.status;
    }

    res.status(status).json({
        success: false,
        message: "Error exists",
        error: message
    });
}

module.exports = errorHandler;