import express from 'express';
import fs from 'fs';
import passport from 'passport';
import LocalStrategy from 'passport-local';


const registerRouter = express.Router();

// define the home page route
registerRouter.get('/register', (req, res) => {
  if (req.user) return res.redirect('/');
  res.sendFile('public/santaRegister.html', { root: '.' });
});

registerRouter.post('/api/addUser', async (req, res) => {
  if (!req.user) return res.status(401).send({ error: 'User not logged in' });
  const result = await createForbiddenPair(req.session.activeGroup._id, req.body);
  if (result.insertedId) return res.send({ success: 'Forbidden pair added', id: result.insertedId });
  res.send({ error: 'Something went wrong' });
});


registerRouter.post('/api/addUser', async (req, res) => {
    // First Validate The Request
        const { error } = validate(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }

        // Check if this user already exisits
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).send('That user already exisits!');
        } else {
            // Insert the new user if they do not exist yet
            user = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            });
            await user.save();
            res.send(user);
        }

});




export { registerRouter };