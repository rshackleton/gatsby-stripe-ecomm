exports.createResolvers = ({ createResolvers }) => {
  const resolvers = {
    StripeProduct: {
      prices: {
        type: ['StripePrice'],
        resolve(source, args, context, info) {
          return context.nodeModel.runQuery({
            query: {
              filter: {
                product: {
                  id: { eq: source.id },
                },
              },
            },
            type: 'StripePrice',
            firstOnly: false,
          });
        },
      },
    },
  };

  createResolvers(resolvers);
};
