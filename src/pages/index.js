import React from 'react';
import { Link, graphql } from 'gatsby';

import Layout from '../components/layout';
import SEO from '../components/seo';

const IndexPage = ({ data }) => (
  <Layout>
    <SEO title="Home" />

    {data.allStripeProduct.edges && (
      <ul>
        {data.allStripeProduct.edges.map(edge => (
          <li key={edge.node.id}>
            <Link to={edge.node.path}>{edge.node.name}</Link>
          </li>
        ))}
      </ul>
    )}
  </Layout>
);

export default IndexPage;

export const query = graphql`
  {
    allStripeProduct {
      edges {
        node {
          id
          name
          path: gatsbyPath(filePath: "/products/{StripeProduct.name}")
        }
      }
    }
  }
`;
