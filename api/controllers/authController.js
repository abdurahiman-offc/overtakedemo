import User from '../models/User.js';

export const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        
        let targetRole = '';
        
        if (username === 'admin@overtkae' && password === 'admin@ overtake') {
            targetRole = 'admin';
        } else if (username === 'salesrep@overtake' && password === 'salesrep@overtake') {
            targetRole = 'sales';
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (targetRole === 'admin') {
            let user = await User.findOne({ role: 'admin' });
            if (!user) {
                user = {
                    _id: 'default-admin-id',
                    username: 'Administrator',
                    role: 'admin'
                };
            }
            return res.json(user);
        } else if (targetRole === 'sales') {
            return res.json({
                _id: 'common-sales-rep',
                username: 'Sales Team',
                role: 'sales'
            });
        }
    } catch (error) { next(error); }
};
