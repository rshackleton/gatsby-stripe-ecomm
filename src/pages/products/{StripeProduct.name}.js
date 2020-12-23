import React, { useState } from 'react';
import { graphql, Link } from 'gatsby';
import orderBy from 'lodash/orderBy';

import Layout from '../../components/layout';
import SEO from '../../components/seo';
import { getStripe } from '../../helpers/getStripe';

const ProductPage = ({ data }) => {
  const [price, setPrice] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const redirectToCheckout = async event => {
    event.preventDefault();

    if (!price || !quantity) {
      return;
    }

    setLoading(true);

    const stripe = await getStripe();

    const { error } = await stripe.redirectToCheckout({
      mode: 'payment',
      lineItems: [{ price: price.id, quantity }],
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
      <h1>
        {data.stripeProduct.name}
        {price && (
          <>
            <br />
            <small>
              {price.metadata.volume} (
              {formatPrice(price.unit_amount / 100, price.currency)})
            </small>
          </>
        )}
      </h1>
      <form onSubmit={redirectToCheckout}>
        <fieldset
          disabled={loading}
          style={{
            display: 'grid',
            gap: '16px',
            gridTemplateColumns: 'auto auto',
            justifyContent: 'flex-start',
            padding: '32px',
          }}
        >
          <label htmlFor="volume">Volume:</label>
          <select
            id="volume"
            name="volume"
            required
            value={price?.id ?? ''}
            onChange={event => {
              setPrice(
                data.stripeProduct.prices.find(
                  p => p.id === event.target.value,
                ),
              );
            }}
          >
            <option value="">Select an option</option>
            {orderBy(data.stripeProduct.prices, ['metadata.order']).map(
              price => (
                <option key={price.id} value={price.id}>
                  {price.metadata.volume} (
                  {formatPrice(price.unit_amount / 100, price.currency)})
                </option>
              ),
            )}
          </select>
          <label htmlFor="quantity">Quantity:</label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min={1}
            required
            value={quantity}
            onChange={event => setQuantity(parseInt(event.target.value, 10))}
          />
          <div style={{ gridColumn: 'span 2' }}>
            <button type="submit">Buy</button>
          </div>
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

function formatPrice(value, currency) {
  return new Intl.NumberFormat(undefined, {
    currency,
    style: 'currency',
  }).format(value);
}
