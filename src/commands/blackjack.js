import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import User from '../models/User.js';

const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function createDeck() {
    const deck = [];
    for (const suit of suits) {
        for (const value of values) {
            deck.push({ suit, value });
        }
    }
    return deck.sort(() => Math.random() - 0.5); // shuffle
}

function getCardValue(card) {
    if (['J', 'Q', 'K'].includes(card.value)) return 10;
    if (card.value === 'A') return 11; // handle Ace later
    return parseInt(card.value);
}

function calculateHand(hand) {
    let total = hand.reduce((sum, card) => sum + getCardValue(card), 0);
    let aces = hand.filter(c => c.value === 'A').length;
    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }
    return total;
}

export default {
    data: new SlashCommandBuilder()
        .setName('blackjack')
        .setDescription('Play a game of blackjack!')
        .addIntegerOption(option =>
            option.setName('bet')
                .setDescription('How much catnip to bet')
                .setRequired(true)
        ),
    async execute(interaction) {
        const bet = interaction.options.getInteger('bet');
        const user = await User.findOne({ discordId: interaction.user.id });

        if (!user) {
            return interaction.reply({ content: "You need to have an account to play!", ephemeral: true });
        }
        if (bet > user.catnip) {
            return interaction.reply({ content: "You don't have enough catnip to bet that much!", ephemeral: true });
        }

        const deck = createDeck();
        const playerHand = [deck.pop(), deck.pop()];
        const dealerHand = [deck.pop(), deck.pop()];

        let playerTotal = calculateHand(playerHand);
        let dealerTotal = calculateHand(dealerHand);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('hit').setLabel('Hit').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('stand').setLabel('Stand').setStyle(ButtonStyle.Secondary)
            );

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.user.username}'s Blackjack`)
            .addFields(
                { name: 'Your Hand', value: playerHand.map(c => `${c.value}${c.suit}`).join(' ') + `\nTotal: ${playerTotal}` },
                { name: 'Dealer Hand', value: `${dealerHand[0].value}${dealerHand[0].suit} ??` }
            );

        await interaction.reply({ embeds: [embed], components: [row] });

        const filter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'hit') {
                playerHand.push(deck.pop());
                playerTotal = calculateHand(playerHand);

                if (playerTotal > 21) {
                    user.catnip -= bet;
                    await user.save();

                    await i.update({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('Bust! You lose!')
                                .addFields(
                                    { name: 'Your Hand', value: playerHand.map(c => `${c.value}${c.suit}`).join(' ') + `\nTotal: ${playerTotal}` },
                                    { name: 'Dealer Hand', value: dealerHand.map(c => `${c.value}${c.suit}`).join(' ') + `\nTotal: ${dealerTotal}` }
                                )
                        ],
                        components: []
                    });
                    collector.stop();
                    return;
                }

                await i.update({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(`${interaction.user.username}'s Blackjack`)
                            .addFields(
                                { name: 'Your Hand', value: playerHand.map(c => `${c.value}${c.suit}`).join(' ') + `\nTotal: ${playerTotal}` },
                                { name: 'Dealer Hand', value: `${dealerHand[0].value}${dealerHand[0].suit} ??` }
                            )
                    ]
                });
            } else if (i.customId === 'stand') {
                // Dealer logic
                while (dealerTotal < 17) {
                    dealerHand.push(deck.pop());
                    dealerTotal = calculateHand(dealerHand);
                }

                let result;
                if (dealerTotal > 21 || playerTotal > dealerTotal) {
                    result = 'You win!';
                    user.catnip += bet;
                } else if (playerTotal < dealerTotal) {
                    result = 'You lose!';
                    user.catnip -= bet;
                } else {
                    result = "It's a tie!";
                }
                await user.save();

                await i.update({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(result)
                            .addFields(
                                { name: 'Your Hand', value: playerHand.map(c => `${c.value}${c.suit}`).join(' ') + `\nTotal: ${playerTotal}` },
                                { name: 'Dealer Hand', value: dealerHand.map(c => `${c.value}${c.suit}`).join(' ') + `\nTotal: ${dealerTotal}` }
                            )
                    ],
                    components: []
                });
                collector.stop();
            }
        });
    }
};
