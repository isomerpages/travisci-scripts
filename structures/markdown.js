module.exports.structure = {
  0: [
    {
      name: 'image',
    },
    {
      name: 'layout',
      required: true,
      requiredValue: 'homepage',
    },
    {
      name: 'title',
      required: true,
    },
    {
      name: 'description',
      required: true,
    },
    {
      name: 'permalink',
      required: true,
      requiredValue: '/',
    },
    {
      name: 'notification',
    },
    {
      name: 'sections',
      required: true,
      children: [
        {
          name: 'hero',
          children: [
            {
              name: 'title',
              required: true,
            },
            {
              name: 'subtitle',
            },
            {
              name: 'background',
              required: true,
            },
            {
              name: 'button',
            },
            {
              name: 'url',
            },
            {
              name: 'dropdown',
              children: [
                {
                  name: 'title',
                  required: true,
                },
                {
                  name: 'options',
                  required: true,
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
            },
            {
              name: 'key_highlights',
              children: [
                {
                  name: 'title',
                  required: true,
                },
                {
                  name: 'description',
                },
                {
                  name: 'url',
                },
              ],
            },
          ],
        },
        {
          name: 'infobar',
          children: [
            {
              name: 'title',
              required: true,
            },
            {
              name: 'subtitle',
            },
            {
              name: 'description',
            },
            {
              name: 'button',
            },
            {
              name: 'url',
            },
          ],
        },
        {
          name: 'infopic',
          children: [
            {
              name: 'title',
              required: true,
            },
            {
              name: 'subtitle',
            },
            {
              name: 'description',
            },
            {
              name: 'button',
            },
            {
              name: 'url',
            },
            {
              name: 'image',
              required: true,
            },
            {
              name: 'alt',
              required: true,
            },
          ],
        },
        {
          name: 'carousel',
          children: [
            {
              name: 'title',
              required: true,
            },
            {
              name: 'subtitle',
            },
            {
              name: 'description',
            },
            {
              name: 'image',
              required: true,
            },
            {
              name: 'alt',
              required: true,
            },
          ],
        },
        {
          name: 'resources',
          children: [
            {
              name: 'title',
            },
            {
              name: 'subtitle',
            },
            {
              name: 'button',
            },
          ],
        },
      ],
    },
  ],
  1: [
    {
      name: 'tag',
    },
    {
      name: 'thumbnail_image',
    },
    {
      name: 'datagovsg-id',
    },
    {
      name: 'layout',
    },
    {
      name: 'title',
      required: true,
    },
    {
      name: 'permalink',
      required: true,
    },
    {
      name: 'image',
    },
    {
      name: 'description',
    },
    {
      name: 'recommender',
    },
    {
      name: 'breadcrumb',
    },
    {
      name: 'published',
    },
    {
      name: 'third_nav_title',
    },
  ],
  2: [
    {
      name: 'layout',
    },
    {
      name: 'title',
      required: true,
    },
    {
      name: 'permalink',
    },
    {
      name: 'file_url',
    },
    {
      name: 'image',
    },
    {
      name: 'description',
    },
    {
      name: 'recommender',
    },
    {
      name: 'breadcrumb',
    },
    {
      name: 'published',
    },
    {
      name: 'date',
    },
  ],
  3: [
    {
      name: 'datagovsg-id',
    },
    {
      name: 'layout',
    },
    {
      name: 'title',
      required: true,
    },
    {
      name: 'permalink',
      required: true,
    },
    {
      name: 'image',
    },
    {
      name: 'description',
    },
    {
      name: 'recommender',
    },
    {
      name: 'breadcrumb',
    },
    {
      name: 'published',
    },
  ],
  4: [
    {
      name: 'layout',
      required: true,
      requiredValue: 'contact_us',
    },
    {
      name: 'title',
    },
    {
      name: 'permalink',
      required: true,
    },
    {
      name: 'agency_name',
    },
    {
      name: 'locations',
      children: [
        {
          name: 'title',
          required: true,
        },
        {
          name: 'address',
          required: true,
        },
        {
          name: 'maps_link',
        },
        {
          name: 'operating_hours',
          children: [
            {
              name: 'days',
              required: true,
            },
            {
              name: 'time',
              required: true,
            },
            {
              name: 'description',
            },
          ],
        },
      ],
    },
    {
      name: 'contacts',
      children: [
        {
          name: 'title',
          required: true,
        },
        {
          name: 'content',
          required: true,
          children: [
            {
              name: 'phone',
            },
            {
              name: 'email',
            },
            {
              name: 'other',
            },
          ],
        },
      ],
    },
  ],
};
