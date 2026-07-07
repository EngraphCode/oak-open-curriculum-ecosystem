import type { Course } from '@/lib/course/types';

/**
 * The shared discriminating fixture for the course shell + player tests: the intro (one section,
 * one coursemap block so the provider wiring is observable), two units, and two modules — module A
 * under u1 with two sections, module B under u2 with one — with DISTINCT accent colours so
 * colour-flow assertions discriminate. It describes the shell's structure, not the real course's
 * counts, so the tests stay stable as the generated data changes. Test-only module.
 */
export const courseFixture: Course = {
  units: [
    { id: 'u1', label: 'Unit 1', title: 'First unit' },
    { id: 'u2', label: 'Unit 2', title: 'Second unit' },
  ],
  intro: {
    id: 'intro',
    title: 'Welcome & overview',
    color: '#fff2aa',
    sections: [
      {
        id: 'introMain',
        title: 'Welcome to the course',
        blocks: [{ t: 'coursemap' }],
      },
    ],
  },
  modules: [
    {
      id: 'u1m1',
      unit: 'u1',
      title: 'Module A',
      color: '#aabbcc',
      colorStrong: '#cccccc',
      outcomes: ['Understand small steps'],
      sections: [
        { id: 'u1m1s1', title: 'Section one', blocks: [{ t: 'text', paras: ['Alpha paragraph'] }] },
        { id: 'u1m1s2', title: 'Section two', blocks: [{ t: 'heading', text: 'Beta heading' }] },
      ],
    },
    {
      id: 'u2m1',
      unit: 'u2',
      title: 'Module B',
      color: '#ddeeff',
      colorStrong: '#cccccc',
      outcomes: [],
      sections: [
        {
          id: 'u2m1s1',
          title: 'Section three',
          blocks: [{ t: 'text', paras: ['Gamma paragraph'] }],
        },
      ],
    },
  ],
};
