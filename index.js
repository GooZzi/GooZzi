require('dotenv').config();
const { Bot, GrammyError } = require('grammy');

const bot = new Bot(process.env.BOT_API_KEY);

// Список пользователей, которые могут отправлять сообщения боту
const authorizedUsers = ['785492955']; // Замените на реальные ID пользователей

// Список групп, в которые бот будет пересылать сообщения
const groupChats = ['-1001980493060']; // Замените на реальные ID групп

// Набор для отслеживания групп, в которых временно приостановлена отправка сообщений
const cooldownGroups = new Set();

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
            setTimeout(() => cooldownGroups.delete(chatId), 120000); // 2 минуты ограничения
        }
        await ctx.reply('Сообщение было успешно отправлено в группы.');
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        await ctx.reply('Произошла ошибка при отправке вашего сообщения.');
    }
});

// Миддлвар для блокировки сообщений от пользователей в группах во время ограничения
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

bot.catch((err) => {
    console.error('Ошибка бота:', err);
});

bot.start();
