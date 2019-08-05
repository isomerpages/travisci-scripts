module.exports.structure = {
  _config: [
    {
      name: 'title',
      required: true,
    },
    {
      name: 'url',
      required: true,
    },
    {
      name: 'collections',
      children: [
        {
          name: {
            regex: '.*',
            humanReadableName: 'Collection name',
          },
          required: true,
          children: [
            {
              name: 'output',
              required: true,
              required_value: true,
            },
          ],
        },
        {
          name: 'haha',
          required: true,
        },
      ],
    },
    {
      name: 'resources_name',
    },
    {
      name: 'favicon',
    },
    {
      name: 'shareicon',
    },
    {
      name: 'google_analytics',
    },
    {
      name: 'recommender',
    },
    {
      name: 'is_government',
    },
    {
      name: 'future',
    },
  ],
};
