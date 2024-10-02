import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'channels', component: () => import('components/AppSidebar.vue') },
      { path: 'chat/:channelName', component: () => import('components/ChatWindow.vue') },
      {path: 'commandline', component: () => import('components/CommandLine.vue')}
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
