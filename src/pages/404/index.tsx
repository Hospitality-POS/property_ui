import { HomeFilled } from '@ant-design/icons';
import { NavLink } from '@umijs/max';
import { Button } from 'antd';
import logo from '/public/assets/images/logo.png';

function index() {
  return (
    <div className="bg-white py-6 sm:py-8 lg:py-12">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
        <div className="flex flex-col items-center">
          <NavLink
            to="/"
            className="mb-8 inline-flex items-center gap-2.5 text-2xl font-bold text-black md:text-3xl"
            aria-label="logo"
          >
            <img src={logo} alt="logo" className="h-16 w-auto" />
          </NavLink>

          <p className="mb-4 text-sm font-semibold uppercase text-gray-500 md:text-base">
            THAT&apos;S A 404
          </p>
          <h1 className="mb-2 text-center text-2xl font-bold text-gray-800 md:text-3xl">
            Page not found
          </h1>

          <p className="mb-12 max-w-screen-md text-center text-gray-500 md:text-lg">
            The page you’re looking for doesn’t exist.
          </p>

          <NavLink to="/">
            <Button
              type="primary"
              className="w-full"
              size="large"
              icon={<HomeFilled />}
            >
              Back to Home
            </Button>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default index;
