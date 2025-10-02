export interface ValidatePokemonGuessOutput {
    typeFeedback: 'green' | 'yellow' | 'red';
    secondaryTypeFeedback: 'green' | 'yellow' | 'red';
    habitatFeedback: 'green' | 'red';
    evolutionStageFeedback: 'green' | 'red';
    heightFeedback: 'green' | 'yellow' | 'red';
    weightFeedback: 'green' | 'yellow' | 'red';
    heightDirection: 'up' | 'down' | 'none';
    weightDirection: 'up' | 'down' | 'none';
    guessedPokemon: {
        name: string;
        photoUrl: string;
        type: string;
        secondaryType: string;
        habitat: string;
        evolutionStage: string;
        height: string;
        weight: string;
    };
}
