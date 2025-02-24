import { PokerPlayer } from "./player";

const tests = ['straight_flush', 'four_of_a_kind', 'full_house', 'flush', 'straight', 'three_of_a_kind', 'two_pair', 'one_pair', 'hi_card'];

export function get_winners(dealercards: string[], my_players: PokerPlayer[]): PokerPlayer[] {
    var winners;
    for (var i = 0; i < tests.length; i++) {
        winners = winners_helper(dealercards, my_players, tests[i]);
        if (winners) {
            break;
        }
    }
    return winners;
}

function execute_test(string, dealercards, playercards) {
    if (string === 'test_straight_flush') {
        return test_straight_flush(dealercards, playercards);
    }
    if (string === 'test_four_of_a_kind') {
        return test_four_of_a_kind(dealercards, playercards);
    }
    if (string === 'test_full_house') {
        return test_full_house(dealercards, playercards);
    }
    if (string === 'test_flush') {
        return test_flush(dealercards, playercards);
    }
    if (string === 'test_straight') {
        return test_straight(dealercards, playercards);
    }
    if (string === 'test_three_of_a_kind') {
        return test_three_of_a_kind(dealercards, playercards);
    }
    if (string === 'test_two_pair') {
        return test_two_pair(dealercards, playercards);
    }
    if (string === 'test_one_pair') {
        return test_one_pair(dealercards, playercards);
    }
    if (string === 'test_hi_card') {
        return test_hi_card(dealercards, playercards);
    }
}

function execute_compare(string, hand_in, best_hand) {
    if (string === 'compare_straight_flush') {
        return compare_straight_flush(hand_in, best_hand);
    }
    if (string === 'compare_four_of_a_kind') {
        return compare_four_of_a_kind(hand_in, best_hand);
    }
    if (string === 'compare_full_house') {
        return compare_full_house(hand_in, best_hand);
    }
    if (string === 'compare_flush') {
        return compare_flush(hand_in, best_hand);
    }
    if (string === 'compare_straight') {
        return compare_straight(hand_in, best_hand);
    }
    if (string === 'compare_three_of_a_kind') {
        return compare_three_of_a_kind(hand_in, best_hand);
    }
    if (string === 'compare_two_pair') {
        return compare_two_pair(hand_in, best_hand);
    }
    if (string === 'compare_one_pair') {
        return compare_one_pair(hand_in, best_hand);
    }
    if (string === 'compare_hi_card') {
        return compare_hi_card(hand_in, best_hand);
    }
}

function winners_helper(dealercards, my_players, test) {
    var best;
    var winners = new Array(my_players.length);
    for (var i = 0; i < my_players.length; i++) {
        if (!my_players[i]) {
            // Busted or folded
            continue;
        }
        var a = execute_test('test_' + test, dealercards, my_players[i].cards);
        var num_needed = a['num_needed'];
        if (num_needed > 0 || (num_needed == 0 && num_needed != '0')) {
            continue;
        }
        if (typeof best === 'undefined') {
            best = a;
            winners = new Array(my_players.length); // intentional ? zorro
            winners[i] = my_players[i];
        } else {
            var comp = execute_compare('compare_' + test, a, best);
            if (comp == 'a') {
                // a won
                best = a;
                winners = new Array(my_players.length); // intentional ? zorro
                winners[i] = my_players[i];
            } else if (comp == 'b') {
                // 'best' is still  best
            } else if (comp == 'c') {
                // A draw, add as a winner
                winners[i] = my_players[i];
            }
        }
    }
    for (i = 0; i < winners.length; i++) {
        if (winners[i]) {
            return winners;
        }
    }
    return null;
}

// STRAIGHT FLUSH RESULT
function test_straight_flush(dealercards, playercards) {
    var my_cards = group_cards(dealercards, playercards);
    var the_suit = get_predominant_suit(my_cards);
    var working_cards = new Array(8);
    var working_index = 0;
    for (var i = 0; i < 7; i++) {
        if (getCardSuit(my_cards[i]) == the_suit) {
            var my_rank = getCardRank(my_cards[i]);
            working_cards[working_index++] = my_rank;
            if (my_rank == 14) {
                working_cards[7] = 1; // ace==1 too
            }
        }
    }
    for (i = 0; i < working_cards.length; i++) {
        if (working_cards[i] == null) {
            working_cards[i] = -1; // FF
        }
    }
    working_cards.sort(compNum);
    var absolute_longest_stretch = 0;
    var absolute_hi_card = 0;
    var current_longest_stretch = 1;
    var current_hi_card = 0;
    for (i = 0; i < 8; i++) {
        var a = working_cards[i];
        var b = working_cards[i + 1];
        if (a && b && a - b == 1) {
            current_longest_stretch++;
            if (current_hi_card < 1) current_hi_card = a;
        } else if (a) {
            if (current_longest_stretch > absolute_longest_stretch) {
                absolute_longest_stretch = current_longest_stretch;
                if (current_hi_card < 1) current_hi_card = a;
                absolute_hi_card = current_hi_card;
            }
            current_longest_stretch = 1;
            current_hi_card = 0;
        }
    }
    var num_mine = 0;
    for (i = 0; i < absolute_longest_stretch; i++) {
        if (the_suit + (absolute_hi_card - i) == playercards[0] || the_suit + (absolute_hi_card - i) == playercards[1]) num_mine++;
    }
    var hash_result = {};
    hash_result['straight_hi'] = absolute_hi_card;
    hash_result['num_needed'] = 5 - absolute_longest_stretch;
    hash_result['num_mine'] = num_mine;
    hash_result['hand_name'] = 'Straight Flush';

    return hash_result;
}

function compare_straight_flush(a, b) {
    return compare_straight(a, b);
}
// ---------------------------------------------------------------------

// FOUR OF A KIND RESULT
function test_four_of_a_kind(dealercards, playercards) {
    var i;
    var my_cards = group_cards(dealercards, playercards);
    var ranks = new Array(13);
    for (i = 0; i < 13; i++) {
        ranks[i] = 0;
    }
    for (i = 0; i < my_cards.length; i++) {
        ranks[getCardRank(my_cards[i]) - 2]++;
    }
    var four = '';
    var kicker = '';
    for (i = 0; i < 13; i++) {
        if (ranks[i] == 4) {
            four = i + 2;
        } else if (ranks[i] > 0) {
            kicker = i + 2;
        }
    }
    var num_mine = 0;
    // @ts-ignore
    if (getCardRank(playercards[0]) == four) {
        num_mine++;
    }
    // @ts-ignore
    if (getCardRank(playercards[1]) == four) {
        num_mine++;
    }
    var num_needed = 4;
    if (four) {
        num_needed = 0;
    }

    var hash_result = {};
    hash_result['rank'] = four;
    hash_result['kicker'] = kicker;
    hash_result['num_needed'] = num_needed;
    hash_result['num_mine'] = num_mine;
    hash_result['hand_name'] = 'Four of a Kind';

    return hash_result;
}

function compare_four_of_a_kind(a, b) {
    var rank_a = a['rank'];
    var rank_b = b['rank'];
    if (rank_a > rank_b) return 'a';
    else if (rank_b > rank_a) return 'b';
    else {
        var kicker_a = a['kicker'];
        var kicker_b = b['kicker'];
        if (kicker_a > kicker_b) return 'a';
        else if (kicker_b > kicker_a) return 'b';
        else return 'c';
    }
}
// ---------------------------------------------------------------------

// FULL HOUSE RESULT
function test_full_house(dealercards, playercards) {
    var my_cards = group_cards(dealercards, playercards);
    var ranks = new Array(13);
    var i;
    for (i = 0; i < 13; i++) {
        ranks[i] = 0;
    }
    for (i = 0; i < my_cards.length; i++) {
        ranks[getCardRank(my_cards[i]) - 2]++;
    }
    var three = '';
    var two = '';
    for (i = 0; i < 13; i++) {
        if (ranks[i] == 3) {
            if (three > two) {
                two = three;
            }
            three = i + 2;
        } else if (ranks[i] == 2) {
            two = i + 2;
        }
    }
    var num_needed = 5;
    var major_rank = '';
    var num_mine_major = 0;
    if (three) {
        num_needed -= 3;
        major_rank = three;
        // @ts-ignore
        if (getCardRank(playercards[0]) == three) num_mine_major += 1;
        // @ts-ignore
        if (getCardRank(playercards[1]) == three) num_mine_major += 1;
    }
    var hash_result = {};
    hash_result['major_rank'] = major_rank;
    hash_result['num_mine_major'] = num_mine_major;

    var minor_rank = '';
    var num_mine_minor = 0;
    if (two) {
        num_needed -= 2;
        minor_rank = two;
        // @ts-ignore
        if (getCardRank(playercards[0]) == two) num_mine_minor += 1;
        // @ts-ignore
        if (getCardRank(playercards[1]) == two) num_mine_minor += 1;
    }
    hash_result['minor_rank'] = minor_rank;
    hash_result['num_mine_minor'] = num_mine_minor;
    hash_result['num_mine'] = num_mine_minor + num_mine_major;
    hash_result['num_needed'] = num_needed;
    hash_result['hand_name'] = 'Full House';

    return hash_result;
}

function compare_full_house(a, b) {
    var major_a = a['major_rank'];
    var major_b = b['major_rank'];
    if (major_a > major_b) return 'a';
    else if (major_b > major_a) return 'b';
    else {
        var minor_a = a['minor_rank'];
        var minor_b = b['minor_rank'];
        if (minor_a > minor_b) return 'a';
        else if (minor_b > minor_a) return 'b';
        else return 'c';
    }
}
// ---------------------------------------------------------------------

// FLUSH RESULT
function test_flush(dealercards, playercards) {
    var i;
    var my_cards = group_cards(dealercards, playercards);
    var the_suit = get_predominant_suit(my_cards);
    var working_cards = new Array(7);
    var working_index = 0;
    var num_in_flush = 0;
    for (i = 0; i < my_cards.length; i++) {
        if (getCardSuit(my_cards[i]) == the_suit) {
            num_in_flush++;
            working_cards[working_index++] = getCardRank(my_cards[i]);
        }
    }
    for (i = 0; i < working_cards.length; i++) {
        if (working_cards[i] == null) {
            working_cards[i] = -1; // FF
        }
    }
    working_cards.sort(compNum);
    var hash_result = {};

    var num_mine = 0;
    for (i = 0; i < 5; i++) {
        var s = working_cards[i];
        if (!s) s = '';
        hash_result['flush_' + i] = s;
        if (the_suit + working_cards[i] == playercards[0] || the_suit + working_cards[i] == playercards[1]) num_mine++;
    }
    hash_result['num_needed'] = 5 - num_in_flush;
    hash_result['num_mine'] = num_mine;
    hash_result['suit'] = the_suit;
    hash_result['hand_name'] = 'Flush';

    return hash_result;
}

function compare_flush(a, b) {
    for (var i = 0; i < 5; i++) {
        var flush_a = a['flush_' + i];
        var flush_b = b['flush_' + i];
        if (flush_a > flush_b) {
            return 'a';
        } else if (flush_b > flush_a) {
            return 'b';
        }
    }
    return 'c';
}
// ---------------------------------------------------------------------

// STRAIGHT RESULT
function test_straight(dealercards, playercards) {
    var i;
    var my_cards = group_cards(dealercards, playercards);
    var working_cards = new Array(8);
    var ranks = new Array(13);
    for (i = 0; i < 7; i++) {
        var my_rank = getCardRank(my_cards[i]);
        if (ranks[my_rank - 2]) continue;
        else ranks[my_rank - 2] = 1;
        working_cards[i] = my_rank;
        if (my_rank == 14) {
            working_cards[7] = 1; // ace==1 too
        }
    }
    for (i = 0; i < working_cards.length; i++) {
        if (working_cards[i] == null) {
            working_cards[i] = -1; // FF
        }
    }
    working_cards.sort(compNum);
    var absolute_longest_stretch = 0;
    var absolute_hi_card = 0;
    var current_longest_stretch = 1;
    var current_hi_card = 0;
    for (i = 0; i < 8; i++) {
        var a = working_cards[i];
        var b = working_cards[i + 1];
        if (a && b && a - b == 1) {
            current_longest_stretch++;
            if (current_hi_card < 1) {
                current_hi_card = a;
            }
        } else if (a) {
            if (current_longest_stretch > absolute_longest_stretch) {
                absolute_longest_stretch = current_longest_stretch;
                if (current_hi_card < 1) {
                    current_hi_card = a;
                }
                absolute_hi_card = current_hi_card;
            }
            current_longest_stretch = 1;
            current_hi_card = 0;
        }
    }
    var num_mine = 0;
    for (i = 0; i < absolute_longest_stretch; i++) {
        if (absolute_hi_card - i == getCardRank(playercards[0]) || absolute_hi_card - i == getCardRank(playercards[1])) {
            num_mine++;
        }
    }
    var hash_result = {};
    hash_result['straight_hi'] = absolute_hi_card;
    hash_result['num_needed'] = 5 - absolute_longest_stretch;
    hash_result['num_mine'] = num_mine;
    hash_result['hand_name'] = 'Straight';

    return hash_result;
}
function compare_straight(a, b) {
    var hi_a = a['straight_hi'];
    var hi_b = b['straight_hi'];
    if (hi_a > hi_b) {
        return 'a';
    } else if (hi_b > hi_a) {
        return 'b';
    } else {
        return 'c';
    }
}
// ---------------------------------------------------------------------

// THREE OF A KIND RESULT
function test_three_of_a_kind(dealercards, playercards) {
    var i;
    var my_cards = group_cards(dealercards, playercards);
    var ranks = new Array(13);
    for (i = 0; i < 13; i++) {
        ranks[i] = 0;
    }
    for (i = 0; i < my_cards.length; i++) {
        ranks[getCardRank(my_cards[i]) - 2]++;
    }
    var three = '';
    var kicker_1 = '';
    var kicker_2 = '';
    for (i = 0; i < 13; i++) {
        if (ranks[i] == 3) {
            three = i + 2;
        } else if (ranks[i] == 1) {
            kicker_2 = kicker_1;
            kicker_1 = i + 2;
        } else if (ranks[i] > 1) {
            kicker_1 = i + 2;
            kicker_2 = i + 2;
        }
    }
    var num_mine = 0;
    // @ts-ignore
    if (getCardRank(playercards[0]) == three) {
        num_mine++;
    }
    // @ts-ignore
    if (getCardRank(playercards[1]) == three) {
        num_mine++;
    }
    var num_needed = 3;
    if (three) {
        num_needed = 0;
    }
    var hash_result = {};
    hash_result['rank'] = three;
    hash_result['num_needed'] = num_needed;
    hash_result['num_mine'] = num_mine;
    hash_result['kicker_1'] = kicker_1;
    hash_result['kicker_2'] = kicker_2;
    hash_result['hand_name'] = 'Three of a Kind';

    return hash_result;
}
function compare_three_of_a_kind(a, b) {
    var rank_a = a['rank'];
    var rank_b = b['rank'];
    if (rank_a > rank_b) {
        return 'a';
    }
    if (rank_b > rank_a) {
        return 'b';
    }
    var kicker_a = a['kicker_1'];
    var kicker_b = b['kicker_1'];
    if (kicker_a > kicker_b) {
        return 'a';
    }
    if (kicker_b > kicker_a) {
        return 'b';
    }
    kicker_a = a['kicker_2'];
    kicker_b = b['kicker_2'];
    if (kicker_a > kicker_b) {
        return 'a';
    }
    if (kicker_b > kicker_a) {
        return 'b';
    }
    return 'c';
}
// ---------------------------------------------------------------------

// TWO PAIR RESULT
function test_two_pair(dealercards, playercards) {
    var i;
    var my_cards = group_cards(dealercards, playercards);
    var ranks = new Array(13);
    for (i = 0; i < 13; i++) ranks[i] = 0;
    for (i = 0; i < my_cards.length; i++) ranks[getCardRank(my_cards[i]) - 2]++;
    var first = '';
    var second = '';
    var kicker = '';
    for (i = 12; i > -1; i--) {
        if (ranks[i] == 2) {
            if (!first) {
                first = i + 2;
            } else if (!second) {
                second = i + 2;
            } else if (!kicker) {
                kicker = i + 2;
            } else {
                break;
            }
        } else if (!kicker && ranks[i] > 0) {
            kicker = i + 2;
        }
    }
    var num_mine = 0;
    // @ts-ignore
    if (getCardRank(playercards[0]) == first || getCardRank(playercards[0]) == second) {
        num_mine++;
    }
    // @ts-ignore
    if (getCardRank(playercards[1]) == first || getCardRank(playercards[1]) == second) {
        num_mine++;
    }
    var num_needed = 2;
    if (second) num_needed = 0;
    else if (first) num_needed = 1;
    else num_needed = 2;
    var hash_result = {};
    hash_result['rank_1'] = first;
    hash_result['rank_2'] = second;
    hash_result['num_needed'] = num_needed;
    hash_result['num_mine'] = num_mine;
    hash_result['kicker'] = kicker;
    hash_result['hand_name'] = 'Two Pair';

    return hash_result;
}
function compare_two_pair(a, b) {
    var rank_a = a['rank_1'];
    var rank_b = b['rank_1'];
    if (rank_a > rank_b) {
        return 'a';
    }
    if (rank_b > rank_a) {
        return 'b';
    }
    rank_a = a['rank_2'];
    rank_b = b['rank_2'];
    if (rank_a > rank_b) {
        return 'a';
    }
    if (rank_b > rank_a) {
        return 'b';
    }
    var kicker_a = a['kicker'];
    var kicker_b = b['kicker'];
    if (kicker_a > kicker_b) {
        return 'a';
    }
    if (kicker_b > kicker_a) {
        return 'b';
    }
    return 'c';
}
// ---------------------------------------------------------------------

// ONE PAIR RESULT
function test_one_pair(dealercards, playercards) {
    var i;
    var my_cards = group_cards(dealercards, playercards);
    var ranks = new Array(13);
    for (i = 0; i < 13; i++) {
        ranks[i] = 0;
    }
    for (i = 0; i < my_cards.length; i++) {
        ranks[getCardRank(my_cards[i]) - 2]++;
    }
    var pair = 0;
    var kicker_1 = '';
    var kicker_2 = '';
    var kicker_3 = '';
    for (i = 0; i < 13; i++) {
        if (ranks[i] == 2) {
            pair = i + 2;
        } else if (ranks[i] == 1) {
            kicker_3 = kicker_2;
            kicker_2 = kicker_1;
            kicker_1 = i + 2;
        } else if (ranks[i] > 2) {
            kicker_1 = i + 2;
            kicker_2 = i + 2;
            kicker_3 = i + 2;
        }
    }
    var num_mine = 0;
    if (getCardRank(playercards[0]) == pair) num_mine++;
    if (getCardRank(playercards[1]) == pair) num_mine++;
    var num_needed = 1;
    if (pair) num_needed = 0;
    var hash_result = {};
    hash_result['rank'] = pair;
    hash_result['num_needed'] = num_needed;
    hash_result['num_mine'] = num_mine;
    hash_result['kicker_1'] = kicker_1;
    hash_result['kicker_2'] = kicker_2;
    hash_result['kicker_3'] = kicker_3;
    hash_result['hand_name'] = 'One Pair';

    return hash_result;
}
function compare_one_pair(a, b) {
    var rank_a = a['rank'];
    var rank_b = b['rank'];
    if (rank_a > rank_b) {
        return 'a';
    }
    if (rank_b > rank_a) {
        return 'b';
    }
    var kicker_a = a['kicker_1'];
    var kicker_b = b['kicker_1'];
    if (kicker_a > kicker_b) {
        return 'a';
    }
    if (kicker_b > kicker_a) {
        return 'b';
    }
    kicker_a = a['kicker_2'];
    kicker_b = b['kicker_2'];
    if (kicker_a > kicker_b) {
        return 'a';
    }
    if (kicker_b > kicker_a) {
        return 'b';
    }
    kicker_a = a['kicker_3'];
    kicker_b = b['kicker_3'];
    if (kicker_a > kicker_b) {
        return 'a';
    }
    if (kicker_b > kicker_a) {
        return 'b';
    }
    return 'c';
}

// ---------------------------------------------------------------------
// HIGH CARD RESULT
function test_hi_card(dealercards, playercards) {
    var i;
    var my_cards = group_cards(dealercards, playercards);
    var working_cards = new Array(my_cards.length);
    for (i = 0; i < working_cards.length; i++) {
        working_cards[i] = getCardRank(my_cards[i]);
    }
    for (i = 0; i < working_cards.length; i++) {
        if (working_cards[i] == null) {
            working_cards[i] = -1; // FF
        }
    }
    working_cards.sort(compNum);
    var hash_result = {};
    for (i = 0; i < 5; i++) {
        if (!working_cards[i]) {
            working_cards[i] = '';
        }
        hash_result['hi_card_' + i] = working_cards[i];
    }
    hash_result['num_needed'] = 0;
    hash_result['hand_name'] = 'High Card';

    return hash_result;
}

function compare_hi_card(a, b) {
    for (var i = 0; i < 5; i++) {
        var hi_a = a['hi_card_' + i];
        var hi_b = b['hi_card_' + i];
        if (hi_a > hi_b) return 'a';
        if (hi_b > hi_a) return 'b';
    }
    return 'c';
}
// ---------------------------------------------------------------------

function get_predominant_suit(my_cards) {
    var suit_count = [0, 0, 0, 0];
    for (var i = 0; i < my_cards.length; i++) {
        var s = getCardSuit(my_cards[i]);
        if (s == 'c') suit_count[0]++;
        else if (s == 's') suit_count[1]++;
        else if (s == 'h') suit_count[2]++;
        else if (s == 'd') suit_count[3]++;
    }
    var suit_index = 0;
    if (suit_count[1] > suit_count[suit_index]) suit_index = 1;
    if (suit_count[2] > suit_count[suit_index]) suit_index = 2;
    if (suit_count[3] > suit_count[suit_index]) suit_index = 3;
    if (suit_index == 0) return 'c';
    if (suit_index == 1) return 's';
    if (suit_index == 2) return 'h';
    if (suit_index == 3) return 'd';
    return '';
}

function getCardRank(cardString) {
    return parseInt(cardString.substring(1, 3));
}
function getCardSuit(cardString) {
    return cardString.charAt(0);
}
function compNum(a, b) {
    return b - a;
}
function group_cards(dealerdeck, playerdeck) {
    var c = new Array(7);
    for (var i = 0; i < 5; i++) {
        c[i] = dealerdeck[i];
    }
    c[5] = playerdeck[0];
    c[6] = playerdeck[1];
    return c;
}
