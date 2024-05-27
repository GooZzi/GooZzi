const dotenv = require('dotenv');
const { next } = require('grammy');
const { Bot, GrammyError } = require('grammy');

dotenv.config();

const bot = new Bot(process.env.BOT_API_KEY);

function escapeMarkdownV2(text) {
    const escapeChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
    return text.split('').map(c => escapeChars.includes(c) ? `\\${c}` : c).join('');
}

bbot.command('push', async (ctx) => {
    const authorizedUsers = ['785492955']; // Замените на реальные ID пользователей
    const groupChats = ['-1001980493060', '5603587091', '1060887470', '6364872291']; // Замените на реальные ID групп
    if (authorizedUsers.includes(ctx.from.id.toString())) {
        const messageText = ctx.message.text.slice(6);

        if (messageText.trim() === '') {
            await ctx.reply('Пожалуйста, добавьте текст сообщения после команды /push.');
            return;
        }

        const formattedMessage = `**${messageText}**`;

        for (const chatId of groupChats) {
            try {
                await bot.api.sendMessage(chatId, escapeMarkdownV2(formattedMessage), { parse_mode: 'MarkdownV2' });
                await new Promise(resolve => setTimeout(resolve, 2000)); // Задержка в 2 секунды
            } catch (error) {
                console.error('Ошибка при отправке сообщения:', error);
            }
        }

        await ctx.reply('Сообщение было успешно отправлено в группы.');
    } else {
        await ctx.reply('У вас нет доступа для использования этой команды.');
    }
});

bot.on('message', async (ctx) => {
    const groupChatsTime = ['-1001980493060']; // Замените на реальные ID групп
    const chatId = ctx.chat?.id.toString();
    const currentHour = new Date().getUTCHours() + 3; // Получаем текущий час в формате UTC и добавляем 3 часа для перевода в МСК

    // Проверяем, является ли чат одной из указанных групп и находится ли текущее время в указанном диапазоне
    if (groupChatsTime.includes(chatId) && (currentHour < 10 || currentHour > 22)) {
        // Если условия выполняются, отправляем сообщение о начале работы группы
        await ctx.reply('К сожалению, режим работы чата с 10:00. Обратитесь за помощью в поддержку на платформе, в соответствующем разделе.');
    } else {
        // Если условия не выполняются, продолжаем обработку сообщений
        await next();
    }
});

bot.catch((err, ctx) => {
    console.error('Ошибка бота:', err);
    ctx.reply(`Произошла ошибка: ${err}`);
});

bot.start();
