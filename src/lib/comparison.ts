import type { PokemonData } from './pokemon-data';

type FeedbackColor = 'green' | 'yellow' | 'red';
type Direction = 'up' | 'down' | 'none';

interface ComparisonFeedback {
    typeFeedback: FeedbackColor;
    secondaryTypeFeedback: FeedbackColor;
    habitatFeedback: FeedbackColor;
    evolutionStageFeedback: FeedbackColor;
    heightFeedback: FeedbackColor;
    weightFeedback: FeedbackColor;
    heightDirection: Direction;
    weightDirection: Direction;
}

export function comparePokemon(guessed: PokemonData, correct: PokemonData): ComparisonFeedback {
    const feedback: ComparisonFeedback = {
        typeFeedback: 'red',
        secondaryTypeFeedback: 'red',
        habitatFeedback: 'red',
        evolutionStageFeedback: 'red',
        heightFeedback: 'red',
        weightFeedback: 'red',
        heightDirection: 'none',
        weightDirection: 'none'
    };

    // Type 1
    if (guessed.types[0] === correct.types[0]) {
        feedback.typeFeedback = 'green';
    } else if (guessed.types[0] === correct.types[1]) {
        feedback.typeFeedback = 'yellow';
    }

    // Type 2
    const guessedT2 = guessed.types[1];
    const correctT2 = correct.types[1];

    if (guessedT2 === correctT2) { // Handles case where both are undefined/null
        feedback.secondaryTypeFeedback = 'green';
    } else if (guessedT2 === correct.types[0]) {
        feedback.secondaryTypeFeedback = 'yellow';
    }

    // Habitat
    if (guessed.habitat === correct.habitat) {
        feedback.habitatFeedback = 'green';
    }

    // Evolution Stage
    if (guessed.evolutionStage === correct.evolutionStage) {
        feedback.evolutionStageFeedback = 'green';
    }

    // Height
    const heightDifference = Math.abs(guessed.height - correct.height);
    if (guessed.height === correct.height) {
        feedback.heightFeedback = 'green';
        feedback.heightDirection = 'none';
    } else if (heightDifference <= correct.height * 0.2) {
        feedback.heightFeedback = 'yellow';
        feedback.heightDirection = 'none';
    } else {
        feedback.heightFeedback = 'red';
        feedback.heightDirection = correct.height > guessed.height ? 'up' : 'down';
    }

    // Weight
    const weightDifference = Math.abs(guessed.weight - correct.weight);
    if (guessed.weight === correct.weight) {
        feedback.weightFeedback = 'green';
        feedback.weightDirection = 'none';
    } else if (weightDifference <= correct.weight * 0.2) {
        feedback.weightFeedback = 'yellow';
        feedback.weightDirection = 'none';
    } else {
        feedback.weightFeedback = 'red';
        feedback.weightDirection = correct.weight > guessed.weight ? 'up' : 'down';
    }

    return feedback;
}
