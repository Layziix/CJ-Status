# CJ-Status

A new version of the existing CJ-Status bot by Layzix. Ludiquement votre.

## Technologies used

- discord.js
- nodemon

## How to setup

### Easy way

Just run ``autosetup.sh``, and now the bot is ready to work.

### Sophisticated way

First let's setup the environnement with ``npm init``.

Then, install both discord.js and nodemon with 
```
npm i nodemon 
npm i discord.js
``` 

After that, run ``node deploy-commands.js``

And the final step is just ``npx nodemon index.js``

## How to use

Now that the bot is setup on the [discord](), you can have acces to a bunch of commands and interactions.

### Commands

Here is the list of all usable command from users with the right permissions :

- /help <command_name> (displayed only for the user)
- /add <music_link>
- /play
- /pause
- /queue
- /link
- /skip
- /stop
- /up
- /down

### Interactions

You can also have the same results with buttons embeded just right under the now playing message !
Only link, queue, help and add are not possible to use since there is no button for them. 
Just click on them and the result will show exactly as a / command would do.