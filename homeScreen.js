/**
 * Home Screen
 * Displays project management UI
 */

class HomeScreen {
  constructor(projectManager, onProjectSelected) {
    this.projectManager = projectManager;
    this.onProjectSelected = onProjectSelected;
  }

  /**
   * Renders the home screen
   * @returns {HTMLElement} The home screen element
   */
  render() {
    const container = document.createElement('div');
    container.id = 'home-screen';
    container.className = 'home-screen';

    // Header
    const header = document.createElement('div');
    header.className = 'home-header';
    const title = document.createElement('h1');
    title.textContent = "Writer's Suite";
    header.appendChild(title);

    // Main content
    const content = document.createElement('div');
    content.className = 'home-content';

    // Actions section
    const actions = document.createElement('div');
    actions.className = 'home-actions';

    const newProjectBtn = document.createElement('button');
    newProjectBtn.className = 'home-action-button';
    newProjectBtn.innerHTML = '<span class="icon">+</span><span>New Project</span>';
    newProjectBtn.addEventListener('click', () => this.onProjectSelected('new'));

    const openProjectBtn = document.createElement('button');
    openProjectBtn.className = 'home-action-button';
    openProjectBtn.innerHTML = '<span class="icon">📁</span><span>Open Project</span>';
    openProjectBtn.addEventListener('click', () => this.onProjectSelected('open'));

    actions.appendChild(newProjectBtn);
    actions.appendChild(openProjectBtn);

    // Recent projects section
    const recentSection = document.createElement('div');
    recentSection.className = 'home-recent';

    const recentTitle = document.createElement('h2');
    recentTitle.textContent = 'Recent Projects';
    recentSection.appendChild(recentTitle);

    const projects = this.projectManager.getAllProjects();
    if (projects.length > 0) {
      const projectsList = document.createElement('div');
      projectsList.className = 'home-projects-list';

      projects.forEach((project) => {
        const projectCard = document.createElement('div');
        projectCard.className = 'home-project-card';
        projectCard.addEventListener('click', () => {
          this.projectManager.loadProject(project.id);
          this.onProjectSelected('loaded');
        });

        const projectName = document.createElement('h3');
        projectName.textContent = project.name;

        const projectInfo = document.createElement('p');
        const date = new Date(project.lastModified);
        projectInfo.textContent = `Last modified: ${date.toLocaleDateString()}`;

        projectCard.appendChild(projectName);
        projectCard.appendChild(projectInfo);
        projectsList.appendChild(projectCard);
      });

      recentSection.appendChild(projectsList);
    } else {
      const noProjects = document.createElement('p');
      noProjects.className = 'home-no-projects';
      noProjects.textContent = 'No projects yet. Create one to get started!';
      recentSection.appendChild(noProjects);
    }

    content.appendChild(actions);
    content.appendChild(recentSection);

    container.appendChild(header);
    container.appendChild(content);

    return container;
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HomeScreen;
}
