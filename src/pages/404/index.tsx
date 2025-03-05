import { HomeFilled } from '@ant-design/icons';
import { NavLink } from '@umijs/max';
import { Button, Result } from 'antd';

function index() {
  return (
    <div className="py-6 sm:py-8 lg:py-12">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
        <div className="flex flex-col items-center">
          <Result
            status="404"
            title="404"
            subTitle={
              <>
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
              </>
            }
            className="mr-2"
            style={{ color: '#1890ff' }}
          />
        </div>
      </div>
    </div>
  );
}

export default index;
