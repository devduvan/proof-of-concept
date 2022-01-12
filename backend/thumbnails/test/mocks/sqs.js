"use strict";

exports.getEventFromImage = (image) => {
  return {
    Records: [
      {
        eventSource: "aws:sqs",
        body: JSON.stringify({
          image: {
            idUser: "dev-user",
            ...image,
            path: `users/dev-user/images/${image.id}/${image.name}`,
          },
        }),
      },
    ],
  };
};
