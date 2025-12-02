/**
 * Layout Templates
 * Defines the default panel layouts for each section of the app
 * Each layout specifies which panels appear and where they're positioned
 */

const layouts = {
  writing: {
    name: 'Writing',
    panels: [
      {
        id: 'editor',
        title: 'Editor',
        x: 0,
        y: 0,
        width: 800,
        height: 600
      },
      {
        id: 'character-panel',
        title: 'Characters',
        x: 810,
        y: 0,
        width: 350,
        height: 280
      },
      {
        id: 'world-panel',
        title: 'World Notes',
        x: 810,
        y: 290,
        width: 350,
        height: 310
      }
    ]
  },

  plotting: {
    name: 'Plotting',
    panels: [
      {
        id: 'plot-board',
        title: 'Plot Board',
        x: 0,
        y: 0,
        width: 900,
        height: 600
      },
      {
        id: 'story-elements',
        title: 'Story Elements',
        x: 910,
        y: 0,
        width: 250,
        height: 600
      }
    ]
  },

  characters: {
    name: 'Characters',
    panels: [
      {
        id: 'character-list',
        title: 'Character List',
        x: 0,
        y: 0,
        width: 1200,
        height: 600
      },
      {
        id: 'character-editor',
        title: 'Character Details',
        x: 910,
        y: 0,
        width: 500,
        height: 600,
        hidden: true
      }
    ]
  },

  worldbuilding: {
    name: 'World Building',
    panels: [
      {
        id: 'world-tree',
        title: 'World Structure',
        x: 0,
        y: 0,
        width: 250,
        height: 600
      },
      {
        id: 'world-editor',
        title: 'World Details',
        x: 260,
        y: 0,
        width: 900,
        height: 600
      }
    ]
  },

  research: {
    name: 'Research',
    panels: [
      {
        id: 'research-list',
        title: 'Research Items',
        x: 0,
        y: 0,
        width: 400,
        height: 600
      },
      {
        id: 'research-viewer',
        title: 'Research Details',
        x: 410,
        y: 0,
        width: 750,
        height: 600
      }
    ]
  }
};
