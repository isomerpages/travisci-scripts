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
      name: 'permalink',
      required: true,
      requiredValue: 'none',
    },
    {
      name: 'baseurl',
      required: true,
    },
    {
      name: 'exclude',
      required: true,
    },
    {
      name: 'include',
      required: true,
    },
    {
      name: 'defaults',
      children: [
        {
          name: 'scope',
          required: true,
          children: [
            {
              name: 'path',
              required: true,
            },
          ],
        },
        {
          name: 'values',
          required: true,
          children: [
            {
              name: 'layout',
              required: true,
              requiredValue: 'page',
            },
          ],
        },
      ],
    },
    {
      name: 'custom_css_path',
      required: true,
    },
    {
      name: 'custom_print_css_path',
      required: true,
    },
    {
      name: 'paginate',
      required: true,
      requiredValue: 12,
    },
    {
      name: 'remote_theme',
      required: true,
      requiredValue: 'isomerpages/isomerpages-template@next-gen',
    },
    {
      name: 'safe',
      required: true,
      requiredValue: false,
    },
    {
      name: 'plugins',
      required: true,
    },
    {
      name: 'description',
      required: true,
    },
  ],
  navigation: [
    {
      name: 'logo',
      required: true,
    },
    {
      name: 'links',
      children: [
        {
          name: 'title',
          required: true,
        },
        {
          name: 'collection',
        },
        {
          name: 'resource_room',
        },
        {
          name: 'sublinks',
          children: [
            {
              name: 'title',
              required: true,
            },
            {
              name: 'url',
              required: true,
            },
          ],
        },
        {
          name: 'url',
        },
      ],
    },
  ],
  footer: [
    {
      name: 'contact_us',
    },
    {
      name: 'show_reach',
    },
    {
      name: 'feedback',
      required: true,
    },
    {
      name: 'faq',
    },
    {
      name: 'privacy_policy',
    },
    {
      name: 'terms_of_use',
    },
    {
      name: 'copyright_agency',
    },
    {
      name: 'social_media',
      children: [
        {
          name: 'facebook',
        },
        {
          name: 'twitter',
        },
        {
          name: 'youtube',
        },
        {
          name: 'instagram',
        },
        {
          name: 'linkedin',
        },
      ],
    },
    {
      name: 'navlinks',
      children: [
        {
          name: 'title',
          required: true,
        },
        {
          name: 'collection',
        },
        {
          name: 'resource_room',
        },
        {
          name: 'sublinks',
          children: [
            {
              name: 'title',
              required: true,
            },
            {
              name: 'url',
              required: true,
            },
          ],
        },
        {
          name: 'url',
        },
      ],
    },
    {
      name: 'links',
      children: [
        {
          name: 'title',
          required: true,
        },
        {
          name: 'url',
          required: true,
        },
      ],
    },
  ],
};
