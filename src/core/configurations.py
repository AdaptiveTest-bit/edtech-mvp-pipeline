import logging
import os


class CustomLogger:
    def __init__(self, log_file: str = "logs/edtech-platform-logs.log"):
        # Ensure the "docs"sfolder exists
        if not os.path.exists("logs"):
            os.makedirs("logs")
            
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.DEBUG)

        # create a file handler and set the level to debug
        file_handler = logging.FileHandler(log_file, mode="a")
        file_handler.setLevel(logging.DEBUG)

        # create a formatter and add it to the handler
        formatter = logging.Formatter(
            "%(asctime)s - %(levelname)s %(funcName)s - %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
        file_handler.setFormatter(formatter)

        self.logger.addHandler(file_handler)

    def get_logger(self):
        return self.logger


custom_logger = CustomLogger()
logger = custom_logger.get_logger()
