



export function renderRules() {
    const ruleContainer = document.getElementById("rulesContainer");
    ruleContainer.innerHTML = "";
    ruleContainer.innerHTML = `
        <div id="ruleCard" class="ruleCard">
        <strong class="number">1.</strong>
        <div class="ruleTextPart">
            <h3 class="header">Start Rule</h3>
            <p class="ruleText">
                All players of the game must define their word (One word).
                Once the words are defined, everyone must vote on the best word.
                The person with the best word gets 1 point.
            </p>

        </div>

    </div>
    <div id="ruleCard2" class="ruleCard">
        <strong class="number">2.</strong>
        <div class="ruleTextPart">
            <h3 class="header">Duel</h3>
            <p class="ruleText">
                When one player Challenger another player to a duel, the challenging player must hide one item on their body or clothes
                The opposing player has 3 questions to determine where the item could be hidden and have to make a guess.
                On each question the rest of the players must count the questions aloud in a choir, if one player refuses or does not
                count, they must drink.
                If the challenger successfully hid the item without the opposing player guessing where it was hidden, they receive 3 points from the
                defending player.
                If the defending player successfully guesses where the item is hidden, they can now lay a rule on the challenging player.
                Each time the rule is broken, they must drink 2 sips from their drink.
            </p>

        </div>
    </div>
    <div id="ruleCard3" class="ruleCard">
        <strong class="number">3.</strong>
        <div class="ruleTextPart">
            <h3 class="header">Cash out</h3>
            <p class="ruleText">
                Once one player has 5 points they have the option to "Cash Out".
                The player must shout "Cash out" followed with a name of a well known person.
                Everyone else must say a name of a person in the same field. The last to do so must drink the rest of their drink.
            </p>
        </div>

    </div>
    <div id="ruleCard4" class="ruleCard">
        <strong class="number">4.</strong>
        <div class="ruleTextPart">
            <h3 class="header">Court</h3>
            <p class="ruleText">
                One player can call out another player for a foul by shouting "RAT" and pointing their finger at the person they are accusing.
                
            </p>
        </div>
    </div>
    <div id="ruleCard5" class="ruleCard">
        <strong class="number">5.</strong>
        <div class="ruleTextPart">
            <h3 class="header">Start Rule</h3>
            <p class="ruleText">

                All players of the game must define their word (words combined).
                Once the words are defined, everyone must vote on the best word.
                The person with the best word gets 1 point.
            </p>

        </div>

    </div>
    <div id="ruleCard6" class="ruleCard">
        <strong class="number">6.</strong>

        <p class="ruleText">
            All players of the game must define their word (words combined).
            Once the words are defined, everyone must vote on the best word.
            The person with the best word gets 1 point.
        </p>
    </div>
    
    
    `;
}