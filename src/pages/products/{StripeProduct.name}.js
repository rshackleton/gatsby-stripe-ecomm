import React, { useState } from 'react';
import { graphql, Link } from 'gatsby';
import orderBy from 'lodash/orderBy';

import Layout from '../../components/layout';
import SEO from '../../components/seo';
import { getStripe } from '../../helpers/getStripe';

const ProductPage = ({ data }) => {
  const [loading, setLoading] = useState(false);

  const redirectToCheckout = async event => {
    event.preventDefault();

    const price = event.target.volume.value;
    const quantity = parseInt(event.target.quantity.value, 10);

    if (!price || !quantity) {
      return;
    }

    setLoading(true);

    const stripe = await getStripe();

    const { error } = await stripe.redirectToCheckout({
      mode: 'payment',
      lineItems: [{ price, quantity }],
      successUrl: `http://localhost:8000/`,
      cancelUrl: window.location.href,
    });

    if (error) {
      console.warn('Error:', error);
      setLoading(false);
    }
  };

  return (
    <Layout>
      <SEO title={`${data.stripeProduct.name}`} />
      <h1>{data.stripeProduct.name}</h1>
      <form onSubmit={redirectToCheckout}>
        <fieldset disabled={loading}>
          <div>
            <label htmlFor="volume">Volume:</label>
            <select id="volume" name="volume" required>
              {orderBy(data.stripeProduct.prices, ['metadata.order']).map(
                price => (
                  <option key={price.id} value={price.id}>
                    {price.metadata.volume}
                  </option>
                ),
              )}
            </select>
          </div>
          <div>
            <label htmlFor="quantity">Quantity:</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              defaultValue={1}
              required
            />
          </div>
          <button type="submit">Buy</button>
        </fieldset>
      </form>
      <Link to="/">Go back to the homepage</Link>
    </Layout>
  );
};

export default ProductPage;

export const query = graphql`
  query($id: String) {
    stripeProduct(id: { eq: $id }) {
      id
      name
      prices {
        id
        active
        currency
        unit_amount
        metadata {
          order
          volume
        }
      }
    }
  }
`;
