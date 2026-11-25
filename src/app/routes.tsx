import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './views/Layout/Layout';
import { PublicationDetail } from './views/PublicationDetail/PublicationDetail';
import { Storefront } from './views/Storefront/Storefront';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Storefront />,
      },
      {
        path: 'publication/:id',
        element: <PublicationDetail />,
      },
    ],
  },
]);
