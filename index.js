const dotenv = require('dotenv');

dotenv.config();
const { next } = require('grammy');
const { Bot, GrammyError } = require('grammy');
const bot = new Bot(process.env.BOT_API_KEY);

const currentHour = new Date().getUTCHours() + 3; // Получаем текущий час в формате UTC и добавляем 3 часа для перевода в МСК

function escapeMarkdownV2(text) {
    const escapeChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
    return text.split('').map(c => escapeChars.includes(c) ? `\\${c}` : c).join('');
}

bot.on('message', async (ctx) => {
    const authorizedUsers = []; // Замените на реальные ID пользователей
    const groupChatsTime = ['-1001980493060', '-4060260673']; // Замените на реальные ID групп
    const chatId = ctx.chat?.id.toString();
    // Проверяем, является ли чат одной из указанных групп и находится ли текущее время в указанном диапазоне
      if (groupChatsTime.includes(chatId) && (currentHour < 10 || currentHour > 22)) {
        // Если условия выполняются, проверяем, является ли пользователь авторизованным
        const isAuthorized = authorizedUsers.includes(ctx.from.id.toString());
        if (!isAuthorized) {
          // Если пользователь не авторизован, отправляем сообщение о начале работы группы
          if (ctx.message?.new_chat_members || ctx.message?.left_chat_member) {
              // Если условия выполняются, игнорируем сообщение
              return;
          }
          await ctx.reply('К сожалению, режим работы чата с 10:00. Обратитесь за помощью в поддержку на платформе, в соответствующем разделе.');
        }
    } else {
        // Если условия не выполняются, продолжаем обработку сообщений
        await next();
    }
  });

bot.command('push', async (ctx) => {
    const authorizedUsers = ['785492955']; // Замените на реальные ID пользователей
    const groupChats = ['-1001980493060']; // Замените на реальные ID групп
    if (authorizedUsers.includes(ctx.from.id.toString())) {
        const messageText = ctx.message.text.slice(6);

        if (messageText.trim() === '') {
            await ctx.reply('Пожалуйста, добавьте текст сообщения после команды /push.');
            return;
        }

        const formattedMessage = `**${messageText}**`;

       try {
    for (const chatId of groupChats) {
        await bot.api.sendMessage(chatId, escapeMarkdownV2(formattedMessage), { parse_mode: 'MarkdownV2' });
    }

            await ctx.reply('Сообщение было успешно отправлено в группы.');
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            await ctx.reply('Произошла ошибка при отправке вашего сообщения.');
        }
    } else {
        await ctx.reply('У вас нет доступа для использования этой команды.');
    }
});
  
bot.catch((err, ctx) => {
    console.error('Ошибка бота:', err);
    await ctx.reply(error)
});

bot.start();
