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
    const groupChats = ['-1001980493060', '-1001767502066''-1001857175790','-1001845076622','-669874108','-100175718'3507,''-100165432'7492,''-100166768'7849,''-100175370'1676,''-100158200'9055,''-1001749412443','-1001530729406','-1001769772155','-1001849828489','-1001733305149','-1001656540195','-1001790637092','-1001775046025','-1001294018674','-1001926464969','-1001884310254','-1001520209434','-1001845256399','-1001343504125','-1001559024516','-1001867637705','-1001857285435','-1001813990309','-1002010518411','-619382253','-1001728011656','-1001531705776','-1001735882530','-1001768832277','-1001874270610','-1001883293200','-682153607','-1001862394148','-1001873024020','-1001978401180','-695473324','-1001576443181','-1001568698273','-1001452499264']; // Замените на реальные ID групп
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
