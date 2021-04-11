

// #todo Simple text field, should be replaced with a modal
export class SuggestionDisplay {
  constructor(props) {
    this.element = document.createElement('p');
    this.element.textContent = 'Предложения по исправлению: ';
    this.suggestionsContainer = document.createElement('strong');
    this.element.appendChild(this.suggestionsContainer);
  }
  
  getElement() {
    return this.element;
  }

  addSuggestions(suggestions) {
    this.suggestionsContainer.textContent = suggestions.join(', ');
  }

  clear() {
    this.suggestionsContainer.textContent = '';
  }
}