import Footer from '@blocklet/ui-react/lib/Footer';
import Header from '@blocklet/ui-react/lib/Header';
import { styled } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Outlet } from 'react-router-dom';

function LayoutFullFooterWidth({ ...rest }: { [key: string]: any }) {
  return (
    <Root {...rest}>
      <Header
        meta={undefined}
        addons={undefined}
        homeLink={undefined}
        theme={undefined}
        hideNavMenu={undefined}
        className="layout-header"
        maxWidth={false}
        sessionManagerProps={{
          onLogout: () => {
            window.location.reload();
          },
        }}
      />
      <Container className="layout-container">
        <main className="layout-main">
          <Outlet />
        </main>
      </Container>
      <Footer
        meta={undefined}
        theme={undefined}
        sx={{
          maxWidth: '100%',
          px: 1,
          '& .MuiContainer-root': {
            margin: 0,
            maxWidth: '100%',
          },
        }}
      />
    </Root>
  );
}

const Root = styled(Box)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  .layout-header {
    flex-shrink: 0;
  }
  .layout-container {
    flex: 1;
    padding-left: 0;
    padding-right: 0;
    max-width: none;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .layout-main {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
`;

export default LayoutFullFooterWidth;
