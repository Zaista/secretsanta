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
  const { username, password } = req.body;
  const existingUser = await db.collection('users').findOne({ username });

  if (existingUser) {
    return res.status(409).json({ message: 'Korisnik već postoji.' });
  }

  // Kreiranje novog korisnika
  const newUser = {
    username,
    password
  };

  // Dodavanje korisnika u kolekciju "users"
  await db.collection('users').insertOne(newUser);

  res.status(201).json({ message: 'Registracija uspešna.' });
  /*  } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Došlo je do greške prilikom registracije.' });
      } finally {
        await client.close(); // Zatvaranje veze sa bazom
      });
*/
});

export { registerRouter };
