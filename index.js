require('dotenv').config();
const { Bot, GrammyError } = require('grammy');

const bot = new Bot(process.env.BOT_API_KEY);

// Список пользователей, которые могут отправлять сообщения боту
const authorizedUsers = ['785492955']; // Замените на реальные ID пользователей


// Список групп, которые нужно проверять
const groupChats = ['-1001980493060'/*Тест на пидора*//*МТС ЗС*/]; // Замените на реальные ID групп
const groupChatsTime = ['-1001980493060'/*Тест на пидора*//*МТС ЗС*/, '-1002117570128']; // Замените на реальные ID групп
const currentHour = new Date().getUTCHours() + 3; // Получаем текущий час в формате UTC и добавляем 3 часа для перевода в МСК
const currentMinutes = new Date().getUTCMinutes(); 
bot.on('message', async (ctx) => {
    const chatId = ctx.chat?.id.toString();
    
    // Проверяем, является ли чат одной из указанных групп и находится ли текущее время в указанном диапазоне
    if (groupChatsTime.includes(chatId) && (currentHour >= 16 || currentHour < 9)) {
        // Если условия выполняются, отправляем сообщение о начале работы группы
        if (ctx.message?.new_chat_members || ctx.message?.left_chat_member) {
            // Если условия выполняются, игнорируем сообщение
            return;
        }
        await ctx.reply('К сожалению, режим работы чата с 10:00 по 19:00 по мск. Сейчас в Москве: '+ currentHour+':'+ currentMinutes  +'. Обратитесь за помощью в поддержку на платформе, в соответствующем разделе.');
    } else {
        // Если условия не выполняются, продолжаем обработку сообщений
        await next();
    }
});
// Набор для отслеживания групп, в которых временно приостановлена отправка сообщений
const cooldownGroups = new Set() ;

bot.command('push', async (ctx) => {
    // Проверяем, разрешен ли пользователь отправлять сообщения
    if (!authorizedUsers.includes(ctx.from.id.toString())) {
        await ctx.reply('У вас нет доступа для использования этой команды.');
        return;
    }

    const messageText = ctx.message.text.slice(6); // Вырезаем команду /push, получаем только текст сообщения

    if (messageText.trim() === '') {
        await ctx.reply('Пожалуйста, добавьте текст сообщения после команды /push.');
        return;
    }

    const formattedMessage = `**${messageText}**`; // Добавляем форматирование для жирного текста

    // Отправка сообщения в указанные группы
    try {
        for (const chatId of groupChats) {
            await bot.api.sendMessage(chatId, formattedMessage, { parse_mode: 'MarkdownV2' }); // Указываем MarkdownV2 для форматирования
            cooldownGroups.add(chatId);
            setTimeout(() => cooldownGroups.delete(chatId), 300000); // 2 минуты ограничения
        }
        await ctx.reply('Сообщение было успешно отправлено в группы.');
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        await ctx.reply('Произошла ошибка при отправке вашего сообщения.');
    }
});

// Мидлвар для блокировки сообщений от пользователей в группах во время ограничения
bot.on('message', async (ctx, next) => {
    const chatId = ctx.chat?.id.toString();
    if (ctx.chat?.type === 'supergroup' || ctx.chat?.type === 'group') {
        if (cooldownGroups.has(chatId)) {
            // Если на группу наложено временное ограничение, блокируем сообщение
            const isAdmin = await bot.api.getChatMember(chatId, ctx.from.id).then((member) => member.status === 'administrator');
            if (!isAdmin) {
                await ctx.deleteMessage().catch(console.error); // Удаление может не сработать, если у бота нет прав
            }
        }
    } else {
        await next();
    }
});

// Добавляем обработчик ошибок
bot.catch((err, ctx) => {
    console.error('Ошибка бота:', err);
    // Отправляем сообщение об ошибке в чат
});

// Запускаем бот
bot.start();
