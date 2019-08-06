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
              requiredValue: true,
            },
          ],
        },
      ],
    },
    {
      name: 'resources_name',
      requiredValue: 'hello',
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
    {
      name: 'defaults',
    },
  ],
};
