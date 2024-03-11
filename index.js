require('dotenv').config();
const{Bot, GrammyError, HttpError} = require('grammy');

const bot = new Bot(process.env.BOT_API_KEY);

bot.command('start', async (ctx) => {
    await ctx.reply('Я работаю, но ебано')
});

bot.command('push', async (ctx) => {
    const chatId = '-1001980493060'; // Фактический идентификатор чата группы
    await bot.api.sendMessage(chatId, ctx.message.text);
    await ctx.reply('Заебал, пока не готово');
});

bot.command('list', async (ctx) => {
    
    const groups = ['Жлуд Варких 1', 'Жлуд Зарких 2', 'Пуд Зарипов 3']; // Пример списка групп
    const groupsList = groups.join('\n'); // Преобразование списка в строку
    await ctx.reply('Выбери группу для отправки:\n' + groupsList);
    
});

bot.catch((err) =>{
    const ctx = err.ctx;
    console.error( `Error while hadling update ${ctx.update.update_id}:`);
    const e= err.error;

    if (e instanceof GrammyError) {
        console.error("Error in request:", e.description);
    }
})

bot.start();