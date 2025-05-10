# base defines a base stage that uses the official python runtime base image
FROM python:3.11-slim AS base

# Add curl for healthcheck and generate a timestamp at build time
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/* && \
    echo "Build timestamp: $(date)" > /build-timestamp.txt

# Set the application directory
WORKDIR /usr/local/app

# Install our requirements.txt
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Create a new stage with a timestamp argument to bust cache
FROM base AS builder
ARG CACHE_DATE=1
RUN echo "Cache busting timestamp: ${CACHE_DATE} - $(date)" > /tmp/cache-date.txt

# Copy all files individually to ensure they get updated
COPY ./templates /usr/local/app/templates
COPY ./static /usr/local/app/static
COPY ./app.py /usr/local/app/app.py

# Add version info based on build timestamp
RUN echo "Version: $(date)" >> /usr/local/app/version.txt

# Final image
FROM base AS final

# Copy everything from the builder stage
COPY --from=builder /usr/local/app /usr/local/app

# Copy the timestamp file to keep track of build time
COPY --from=builder /tmp/cache-date.txt /usr/local/app/cache-date.txt

# Make port 80 available for links and/or publish
EXPOSE 80

# Define our command to be run when launching the container
CMD ["gunicorn", "app:app", "-b", "0.0.0.0:80", "--log-file", "-", "--access-logfile", "-", "--workers", "4", "--keep-alive", "0"]
