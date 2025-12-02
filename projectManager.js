/**
 * Project Manager
 * Handles creating, loading, and managing projects
 */

class ProjectManager {
  constructor() {
    this.projects = [];
    this.currentProject = null;
  }

  /**
   * Creates a new project
   * @param {string} name - Project name
   * @param {Array} enabledSections - Array of section names user wants to use
   * @param {string} storageType - 'local', 'onedrive', 'googledrive'
   * @returns {Object} The created project
   */
  createProject(name, enabledSections, storageType = 'local') {
    const project = {
      id: this.generateProjectId(),
      name: name,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      enabledSections: enabledSections,
      storageType: storageType,
      data: {
        // This will hold all project data
        characters: [],
        world: [],
        plotting: [],
        writing: [],
        research: []
      }
    };

    this.projects.push(project);
    this.currentProject = project;
    return project;
  }

  /**
   * Gets all projects
   * @returns {Array} Array of projects
   */
  getAllProjects() {
    return this.projects;
  }

  /**
   * Loads a project by ID
   * @param {string} projectId - The project ID
   * @returns {Object} The loaded project
   */
  loadProject(projectId) {
    const project = this.projects.find((p) => p.id === projectId);
    if (project) {
      this.currentProject = project;
      return project;
    }
    return null;
  }

  /**
   * Gets the current project
   * @returns {Object} The current project
   */
  getCurrentProject() {
    return this.currentProject;
  }

  /**
   * Saves the current project
   */
  saveCurrentProject() {
    if (this.currentProject) {
      this.currentProject.lastModified = new Date().toISOString();
      // Data will be persisted to file via IPC
      return this.currentProject;
    }
    return null;
  }

  /**
   * Generates a unique project ID
   * @returns {string} Unique ID
   */
  generateProjectId() {
    return 'project_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Deletes a project by ID
   * @param {string} projectId - The project ID to delete
   */
  deleteProject(projectId) {
    this.projects = this.projects.filter((p) => p.id !== projectId);
    if (this.currentProject && this.currentProject.id === projectId) {
      this.currentProject = null;
    }
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectManager;
}
