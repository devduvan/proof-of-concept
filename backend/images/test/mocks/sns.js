"use strict";

exports.getEventFromImage = (image) => {
  return {
    Records: [
      {
        EventSource: "aws:sns",
        Sns: {
          Type: "Notification",
          Subject: "thumbnails-generated",
          Message: JSON.stringify({
            image: {
              idUser: "dev-user",
              ...image,
              path: `users/dev-user/images/${image.id}/${image.name}`,
            },
          }),
        },
      },
    ],
  };
};
