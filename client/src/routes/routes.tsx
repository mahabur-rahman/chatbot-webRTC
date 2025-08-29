import Home from '../pages/Home';
import Room from '../pages/Room';

const routes = [
  { path: '/', element: <Home /> },
  { path: '/room/:roomCode', element: <Room /> },
];

export default routes;