import _, { without, isObject } from 'lodash';

// nice-to-haves
// TODO complain if seeded roles exceed allowed distributions
// TODO maybe genericize first night demon stuff if helps for advanced roles

// need-to-haves
// TODO exclude librarian if no outsiders exist
// TODO add drunk
// TODO add reminder text per-role (e.g. if the virgin is nominated by a townsfolk, and virgin is not drunk|poisoned, that townsfolk is executed)

export enum Townsfolk {
    Washerwoman = 'Washerwoman',
    Librarian = 'Librarian',
    Investigator = 'Investigator',
    Chef = 'Chef',
    Empath = 'Empath',
    FortuneTeller = 'Fortune Teller',
    Undertaker = 'Undertaker',
    Monk = 'Monk',
    Ravenkeeper = 'Ravenkeeper',
    Virgin = 'Virgin',
    Slayer = 'Slayer',
    Soldier = 'Soldier',
    Mayor = 'Mayor',
}

interface NightInstruction {
    role: Role;
    instructionText: string;
    isFirstNightOnly?: true;
    isSubsequentNightsOnly?: true;
}

export enum Outsider {
    Butler = 'Butler',
    Drunk = 'Drunk',
    Recluse = 'Recluse',
    Saint = 'Saint',
}

export enum Minion {
    Poisoner = 'Poisoner',
    Spy = 'Spy',
    ScarletWoman = 'Scarlet Woman',
    Baron = 'Baron',
}

enum Demon {
    Imp = 'Imp',
}

export type Role = Townsfolk | Outsider | Minion | Demon;
export type SeedableRole = Townsfolk | Outsider | Minion;

const NightInstruction: NightInstruction[] = [
    {
        role: Townsfolk.Empath,
        instructionText: 'Choose a red herring for the empath.',
        isFirstNightOnly: true,
    },
    {
        role: Minion.Poisoner,
        instructionText: 'Ask NAME to specify a player to poison.',
    },
    {
        role: Townsfolk.Monk,
        instructionText:
            'Ask NAME to specify a player to protect from the demon (if poisoned|drunk, their choice is ignored).',
    },
    {
        role: Minion.Spy,
        instructionText:
            'Give NAME the list of players, their roles, which three characters the demon was told about, and all statuses like red herring or poisoned.',
    },
    {
        role: Minion.ScarletWoman,
        instructionText:
            'If the Scarlet Woman (NAME) became the Imp today, tell them they are now the imp.',
        isSubsequentNightsOnly: true,
    },
    {
        role: Demon.Imp,
        instructionText:
            'Ask NAME to choose a player. That player dies unless their are the soldier or protected by the monk.',
        isSubsequentNightsOnly: true,
    },
    {
        role: Townsfolk.Ravenkeeper,
        instructionText:
            'If the ravenkeeper (NAME) was killed by the demon tonight, ask NAME to choose a player. Tell that players character role (if poisoned|drunk, tell incorrect role).',
        isSubsequentNightsOnly: true,
    },
    {
        role: Townsfolk.Undertaker,
        instructionText:
            'If a player was executed yesterday, tell the undertaker (NAME) their role (if poisoned|drunk, tell incorrect role).',
        isSubsequentNightsOnly: true,
    },
    {
        role: Townsfolk.Washerwoman,
        instructionText:
            'Tell NAME a townsfolk and two players - one of whom is that townsfolk (if poisoned|drunk, tell two incorrect players).',
        isFirstNightOnly: true,
    },
    {
        role: Townsfolk.Librarian,
        instructionText:
            'Tell NAME an outsider and two players - one of whom is that outsider (if poisoned|drunk, tell two incorrect players).',
        isFirstNightOnly: true,
    },
    {
        role: Townsfolk.Investigator,
        instructionText:
            'Tell NAME a minion and two players - one of whom is that minion (if poisoned|drunk, tell two incorrect players).',
        isFirstNightOnly: true,
    },
    {
        role: Townsfolk.Chef,
        instructionText:
            'Tell NAME the number of evil pairs sitting next to each other (if poisoned|drunk, lie).',
        isFirstNightOnly: true,
    },
    {
        role: Townsfolk.Empath,
        instructionText:
            'Tell NAME the number of alive evil players sitting next to them (if poisoned|drunk, lie).',
    },
    {
        role: Townsfolk.FortuneTeller,
        instructionText:
            'Ask NAME to choose two players. Say yes if either is the demon (if poisoned|drunk, lie).',
    },
    {
        role: Outsider.Butler,
        instructionText:
            'Ask NAME to choose a player. This is their master. Their vote counts for 0 unless their master also votes (unless poisoned).',
    },
];

interface RoleDistribution {
    townsfolk?: number;
    outsider?: number;
    minion: number;
    demon: number;
}

export type PretendingRole = { role: Role; pretendRole: Role };
export const PretendingRole = {
    guard: (x: Role | PretendingRole): x is PretendingRole =>
        isObject(x) && x.hasOwnProperty('pretendRole'),
};

export interface Script {
    publicRoleDistribution: RoleDistribution;
    playerSeating: string[];
    playerRoles: {
        [player: string]: Role | PretendingRole;
    };
    firstNightInstructions: string[];
    otherNightsInstructions: string[];
}

const roleDistributionByPlayerCount: { [count: number]: RoleDistribution } = {
    5: {
        minion: 1,
        demon: 1,
    },
    6: {
        outsider: 1,
        minion: 1,
        demon: 1,
    },
    7: {
        minion: 1,
        demon: 1,
    },
    8: {
        outsider: 1,
        minion: 1,
        demon: 1,
    },
    9: {
        outsider: 2,
        minion: 1,
        demon: 1,
    },
    10: {
        minion: 2,
        demon: 1,
    },
    11: {
        outsider: 1,
        minion: 2,
        demon: 1,
    },
    12: {
        outsider: 2,
        minion: 2,
        demon: 1,
    },
    13: {
        minion: 3,
        demon: 1,
    },
    14: {
        outsider: 1,
        minion: 3,
        demon: 1,
    },
    15: {
        outsider: 2,
        minion: 3,
        demon: 1,
    },
};

const shuffle = <T>(array: T[]): T[] => {
    let currentIndex = array.length;
    let temporaryValue: T;
    let randomIndex: number;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
};

const getMinionPlayerNames = (
    playersByRole: { [role in Role]?: string },
): string[] => {
    const names: string[] = [];
    Object.values(Minion).forEach((role) => {
        const player = playersByRole[role];
        if (!player) return;
        names.push(player);
    });
    return names;
};

const makeInstruction = (
    role: Role,
    player: string,
    instructionText: string,
): string => `${role} - ${instructionText.replace('NAME', player)}`;

const getCharactersNotInPlay = (playerRoles: {
    [player: string]: Role | PretendingRole;
}): Role[] => {
    const roleSet = new Set<Role>(
        Object.values(playerRoles).map(getApparentRole),
    );
    return [...Object.values(Townsfolk), ...Object.values(Outsider)].reduce<
        Role[]
    >((memo, role) => {
        if (roleSet.has(role)) return memo;
        memo.push(role);
        return memo;
    }, []);
};

const getApparentRole = (role: Role | PretendingRole): Role =>
    PretendingRole.guard(role) ? role.pretendRole : role;

const makeNightInstructions = (playerRoles: {
    [player: string]: Role | PretendingRole;
}): {
    firstNightInstructions: string[];
    otherNightsInstructions: string[];
} => {
    const playersByRole = Object.keys(playerRoles).reduce<
        { [role in Role]?: string }
    >((memo, player) => {
        memo[getApparentRole(playerRoles[player])] = player;
        return memo;
    }, {});

    const minions = getMinionPlayerNames(playersByRole);
    const demon = playersByRole[Demon.Imp];
    const charactersNotInPlay = getCharactersNotInPlay(playerRoles);

    const firstNightInstructions = [
        ...minions.map<string>(
            (player) => `Tell ${player} that ${demon} is the demon`,
        ),
        `Tell the demon (${demon}) their minions: ${minions.join(', ')}`,
        `Tell the demon (${demon}) that three of these characters are not in play: ${charactersNotInPlay.join(
            ', ',
        )}`,
        ...NightInstruction.reduce<string[]>((memo, instruction) => {
            const player = playersByRole[instruction.role];
            if (instruction.isSubsequentNightsOnly || !player) return memo;
            memo.push(
                makeInstruction(
                    instruction.role,
                    player,
                    instruction.instructionText,
                ),
            );
            return memo;
        }, []),
    ];

    const otherNightsInstructions: string[] = NightInstruction.reduce<string[]>(
        (memo, instruction) => {
            const player = playersByRole[instruction.role];
            if (instruction.isFirstNightOnly || !player) return memo;
            memo.push(
                makeInstruction(
                    instruction.role,
                    player,
                    instruction.instructionText,
                ),
            );
            return memo;
        },
        [],
    );

    return { firstNightInstructions, otherNightsInstructions };
};

const PruneRulesByRole: {
    [role in Role]?: (
        distrubition: RoleDistribution & { townsfolk: number },
    ) => boolean;
} = {
    [Townsfolk.Librarian]: (distribution) => Boolean(distribution.outsider),
};

const pruneRoles = (
    roles: Role[],
    distribution: RoleDistribution & { townsfolk: number },
): Role[] =>
    roles.filter((x) => {
        const filter = PruneRulesByRole[x];
        return filter === undefined || filter(distribution);
    });

export const makeScript = (
    players: string[],
    seededRoles: Role[] = [],
): Script => {
    const initRoleDistribution = roleDistributionByPlayerCount[players.length];
    if (!initRoleDistribution) throw new Error('Unsupported number of players');

    const publicRoleDistribution = {
        townsfolk:
            players.length -
            initRoleDistribution.demon -
            initRoleDistribution.minion -
            (initRoleDistribution.outsider || 0),
        outsider: initRoleDistribution.outsider || 0,
        minion: initRoleDistribution.minion,
        demon: initRoleDistribution.demon,
    };

    const hasDrunk = seededRoles.includes(Outsider.Drunk);
    const hasBaron = seededRoles.includes(Minion.Baron);
    const playerSeating = shuffle(players);
    const outsiderCount =
        (publicRoleDistribution.outsider || 0) +
        (hasBaron ? 2 : 0) -
        (hasDrunk ? 1 : 0);
    const townsfolkCount =
        players.length -
        publicRoleDistribution.demon -
        publicRoleDistribution.minion -
        outsiderCount;

    const finalDistribution = {
        demon: publicRoleDistribution.demon,
        outsider: outsiderCount,
        minion: publicRoleDistribution.minion,
        townsfolk: townsfolkCount,
    };

    const roles: (Role | PretendingRole)[] = shuffle([
        ...generateRoles(publicRoleDistribution.demon, Object.values(Demon)),
        ...generateRoles(
            publicRoleDistribution.minion,
            pruneRoles(Object.values(Minion), finalDistribution),
            seededRoles,
            [Minion.Baron],
        ),
        ...generateRoles(
            outsiderCount,
            pruneRoles(Object.values(Outsider), finalDistribution),
            without(seededRoles, Outsider.Drunk),
            [Outsider.Drunk],
        ),
        ...assignDrunk(
            generateRoles(
                townsfolkCount,
                pruneRoles(Object.values(Townsfolk), finalDistribution),
                seededRoles,
            ),
            hasDrunk,
        ),
    ]);

    const playerRoles = playerSeating.reduce<{
        [player: string]: Role | PretendingRole;
    }>((memo, player, i) => {
        memo[player] = roles[i];
        return memo;
    }, {});

    const {
        firstNightInstructions,
        otherNightsInstructions,
    } = makeNightInstructions(playerRoles);

    return {
        publicRoleDistribution,
        playerSeating,
        playerRoles,
        firstNightInstructions,
        otherNightsInstructions,
    };
};

const generateRoles = (
    count: number,
    roles: Role[],
    allSeededRoles: Role[] = [],
    randomBlacklist: Role[] = [],
): Role[] => {
    const randomBlacklistSet = new Set(randomBlacklist);
    const seededRoles = _.intersection(roles, allSeededRoles);
    const seededRoleSet = new Set(allSeededRoles);
    const remainingRoles = roles.reduce<Role[]>((memo, r) => {
        if (seededRoleSet.has(r) || randomBlacklistSet.has(r)) return memo;
        memo.push(r);
        return memo;
    }, []);
    const remainderCount = count - seededRoles.length;
    return [
        ...seededRoles,
        ...shuffle(remainingRoles).slice(0, remainderCount),
    ];
};

const assignDrunk = (
    roles: Role[],
    hasDrunk: boolean,
): (Role | PretendingRole)[] => {
    if (!hasDrunk) return roles;
    const allTownsfolk = new Set<Role>(Object.values(Townsfolk));
    const assignedTownsfolk = roles.filter((r) => allTownsfolk.has(r));
    const drunk = shuffle(assignedTownsfolk)[0];
    return roles.map((r) =>
        r === drunk ? { role: Outsider.Drunk, pretendRole: r } : r,
    );
};

// const printScript = (script: Script): void => {
//     console.log(`
// Trouble Brewing for ${script.playerSeating.length} players

// -- Player Seating (without roles - copy this to the players):
//   ${script.playerSeating.join('\n  ')}

// -- Player Seating (with roles - keep this secret):
//   ${script.playerSeating
//       .map((player) => `${player} (${script.playerRoles[player]})`)
//       .join('\n  ')}

// -- First Night Instructions:
//   # ${script.firstNightInstructions.join('\n  # ')}

// -- Other Night Instructions:
//   # ${script.otherNightsInstructions.join('\n  # ')}
// `);
// };

// // const myScript = makeScript(
// //     ['Alex', 'Dash', 'Naomi', 'Isobel', 'Nika', 'Kristy'],
// //     // [Minion.Baron],
// // );
// // printScript(myScript);
