import jwt from 'jsonwebtoken';

const gAuthMiddleware = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];

    if(!token) {
        return res.status(401).json({ message: 'You are not logged in !' });
    }
    try{
        const decoded  = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // attached user to the request . 
        next();
    }
    catch(err) {
        return res.status(403).json({ message: 'Invalid token !' });
    }
}

export default gAuthMiddleware;